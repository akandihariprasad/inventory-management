import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject = new BehaviorSubject<string | null>(null);

    constructor(private injector: Injector) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authService = this.injector.get(AuthService);

        // Only public endpoints that don't require authentication
        if (this.isPublicEndpoint(req)) {
            return next.handle(req);
        }

        // For all other endpoints, require authentication
        const token = authService.getToken();

        if (!token) {
            // No token, redirect to login
            authService.logout();
            return throwError(() => new Error('Authentication required'));
        }

        // Check if token is expired
        if (authService.isTokenExpired(token)) {
            return this.handleTokenExpired(req, next, authService);
        }

        // Add token to request
        const authReq = this.addTokenToRequest(req, token);

        return next.handle(authReq).pipe(
            catchError(error => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    return this.handle401Error(authReq, next, authService);
                }
                return throwError(() => error);
            })
        );
    }

    private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    private handleTokenExpired(request: HttpRequest<any>, next: HttpHandler, authService: AuthService): Observable<HttpEvent<any>> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return authService.refreshToken().pipe(
                switchMap((response: any) => {
                    const accessToken = response.data?.accessToken || response.accessToken;

                    if (!accessToken) {
                        throw new Error('No access token in refresh response');
                    }

                    this.isRefreshing = false;
                    this.refreshTokenSubject.next(accessToken);
                    return next.handle(this.addTokenToRequest(request, accessToken));
                }),
                catchError(error => {
                    this.isRefreshing = false;
                    authService.logout();
                    return throwError(() => error);
                })
            );
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap(token => next.handle(this.addTokenToRequest(request, token!)))
            );
        }
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler, authService: AuthService): Observable<HttpEvent<any>> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return authService.refreshToken().pipe(
                switchMap((response: any) => {
                    const accessToken = response.data?.accessToken || response.accessToken;

                    if (!accessToken) {
                        throw new Error('No access token in refresh response');
                    }

                    this.isRefreshing = false;
                    this.refreshTokenSubject.next(accessToken);
                    return next.handle(this.addTokenToRequest(request, accessToken));
                }),
                catchError(error => {
                    this.isRefreshing = false;
                    authService.logout();
                    return throwError(() => error);
                })
            );
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap(token => next.handle(this.addTokenToRequest(request, token!)))
            );
        }
    }

    private isPublicEndpoint(req: HttpRequest<any>): boolean {
        const url = req.url.toLowerCase();
        // Only these endpoints are public (no authentication required)
        return url.includes('/auth/login') ||
            url.includes('/auth/register') ||
            url.includes('/auth/refresh');
    }
}
