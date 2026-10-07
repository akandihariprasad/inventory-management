import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class LandingComponent {
  mobileMenuOpen = false;

  constructor(private router: Router) { }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegisterOwner(): void {
    this.router.navigate(['/register/owner']);
  }

  navigateToRegisterSupplier(): void {
    this.router.navigate(['/register/supplier']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}