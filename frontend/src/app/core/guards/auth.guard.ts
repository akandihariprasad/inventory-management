import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        // Check if user is authenticated
        if (this.authService.isAuthenticated()) {
            const user = this.authService.getUser();

            // Check if password reset is required
            if (user?.isPasswordResetRequired) {
                if (state.url.split('?')[0] === '/set-password') {
                    return true;
                }

                this.router.navigate(['/set-password']);
                return false;
            }
            return true;
        }

        // Store the attempted URL for redirecting after login
        localStorage.setItem('redirectUrl', state.url);
        this.router.navigate(['/login']);
        return false;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }
}
