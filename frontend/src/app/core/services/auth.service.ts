import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
    LoginRequest,
    LoginResponse,
    User,
    RegisterOwnerRequest,
    RegisterSupplierRequest,
    SetPasswordRequest
} from '../models/user.model';
import { Router } from '@angular/router';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        this.loadStoredUser();
    }

    login(request: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse | ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/login`, request)
            .pipe(
                map(response => this.unwrapResponse(response)),
                tap(response => this.handleAuthResponse(response)),
                catchError(this.handleError)
            );
    }

    registerOwner(request: RegisterOwnerRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse | ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/register/owner`, request)
            .pipe(
                map(response => this.unwrapResponse(response)),
                tap(response => this.handleAuthResponse(response)),
                catchError(this.handleError)
            );
    }

    registerSupplier(request: RegisterSupplierRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse | ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/register/supplier`, request)
            .pipe(
                map(response => this.unwrapResponse(response)),
                tap(response => this.handleAuthResponse(response)),
                catchError(this.handleError)
            );
    }

    setPassword(request: SetPasswordRequest): Observable<any> {
        const token = this.getToken();
        if (!token) {
            this.logout();
            return throwError(() => new Error('No authentication token'));
        }

        return this.http.post(`${this.apiUrl}/auth/set-password`, request, {
            headers: { Authorization: `Bearer ${token}` }
        }).pipe(catchError(this.handleError));
    }

    refreshToken(): Observable<LoginResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            this.logout();
            return throwError(() => new Error('No refresh token available'));
        }

        return this.http.post<LoginResponse | ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/refresh`, { refreshToken })
            .pipe(
                map(response => this.unwrapResponse(response)),
                tap(response => this.handleAuthResponse(response)),
                catchError(error => {
                    this.logout();
                    return this.handleError(error);
                })
            );
    }

    changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
        const token = this.getToken();
        if (!token) {
            this.logout();
            return throwError(() => new Error('No authentication token'));
        }

        return this.http.post(`${this.apiUrl}/auth/change-password`, data, {
            headers: { Authorization: `Bearer ${token}` }
        }).pipe(catchError(this.handleError));
    }

    logout(): void {
        const token = this.getToken();
        if (token) {
            this.http.post(`${this.apiUrl}/auth/logout`, null, {
                headers: { Authorization: `Bearer ${token}` }
            }).subscribe();
        }
        this.clearStorage();
        this.router.navigate(['/']);
    }

    getToken(): string | null {
        return localStorage.getItem(environment.tokenKey);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(environment.refreshTokenKey);
    }

    getUser(): User | null {
        return this.currentUserSubject.value;
    }

    markPasswordResetComplete(): void {
        const user = this.getUser();
        if (!user) {
            return;
        }

        const updatedUser: User = {
            ...user,
            isPasswordResetRequired: false
        };

        localStorage.setItem(environment.userKey, JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        const user = this.getUser();
        return !!token && !!user && !this.isTokenExpired(token);
    }

    isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp < Date.now() / 1000;
        } catch {
            return true;
        }
    }

    hasRole(roles: string[]): boolean {
        const user = this.currentUserSubject.value;
        return user ? roles.includes(user.role) : false;
    }

    private handleAuthResponse(response: LoginResponse): void {
        // Store tokens
        localStorage.setItem(environment.tokenKey, response.accessToken);
        localStorage.setItem(environment.refreshTokenKey, response.refreshToken);

        // Create user object
        const user: User = {
            id: response.userId,
            name: response.name,
            email: response.email,
            role: response.role,
            companyId: response.companyId,
            isActive: true,
            isPasswordResetRequired: this.getPasswordResetRequired(response),
            createdAt: new Date()
        };

        localStorage.setItem(environment.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    private unwrapResponse(response: LoginResponse | ApiResponse<LoginResponse>): LoginResponse {
        const authResponse = response && typeof response === 'object' && 'data' in response
            ? (response as ApiResponse<LoginResponse>).data
            : response as LoginResponse;

        return {
            ...authResponse,
            isPasswordResetRequired: this.getPasswordResetRequired(authResponse)
        };
    }

    private getPasswordResetRequired(response: any): boolean {
        return Boolean(
            response?.isPasswordResetRequired ??
            response?.passwordResetRequired ??
            response?.forcePasswordReset ??
            response?.mustChangePassword
        );
    }

    private loadStoredUser(): void {
        const userStr = localStorage.getItem(environment.userKey);
        const token = this.getToken();

        if (userStr && token) {
            try {
                const user = JSON.parse(userStr);
                // Check if token is still valid
                if (!this.isTokenExpired(token)) {
                    this.currentUserSubject.next(user);
                } else {
                    // Token expired, try to refresh
                    this.refreshToken().subscribe({
                        error: () => this.clearStorage()
                    });
                }
            } catch (error) {
                this.clearStorage();
            }
        } else {
            this.currentUserSubject.next(null);
        }
    }

    private clearStorage(): void {
        localStorage.removeItem(environment.tokenKey);
        localStorage.removeItem(environment.refreshTokenKey);
        localStorage.removeItem(environment.userKey);
        this.currentUserSubject.next(null);
    }

    private handleError(error: any): Observable<never> {
        return throwError(() => error);
    }
}
