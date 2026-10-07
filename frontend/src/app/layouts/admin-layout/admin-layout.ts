import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-layout',
    templateUrl: './admin-layout.html',
    styleUrls: ['./admin-layout.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
    @ViewChild('sidenav') sidenav!: MatSidenav;
    isSidebarOpen = true;
    currentUser: User | null = null;
    isMobile = false;
    isSupplier = false;
    isOwner = false;
    isAdmin = false;
    isManager = false;
    isWorker = false;
    isSuperAdmin = false;
    private userSubscription: Subscription | null = null;

    constructor(public authService: AuthService, public router: Router, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        // Immediately get current user
        this.currentUser = this.authService.getUser();
        this.updateRoles();
        this.cdr.markForCheck();

        // Subscribe to future user changes
        this.userSubscription = this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            this.updateRoles();
            this.cdr.markForCheck();
        });
    }

    ngOnDestroy(): void {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    updateRoles(): void {
        if (this.currentUser) {
            const role = this.currentUser.role;
            this.isSupplier = role === 'SUPPLIER';
            this.isOwner = role === 'OWNER';
            this.isAdmin = role === 'ADMIN';
            this.isManager = role === 'MANAGER';
            this.isWorker = role === 'WORKER';
            this.isSuperAdmin = role === 'SUPER_ADMIN';
        }
    }

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
        this.cdr.markForCheck();
    }

    onNavItemClick(): void {
        if (this.isMobile) {
            this.isSidebarOpen = false;
            this.cdr.markForCheck();
        }
    }

    hasRole(roles: string[]): boolean {
        if (!this.currentUser) return false;
        return roles.includes(this.currentUser.role);
    }

    logout(): void {
        this.authService.logout();
    }
}