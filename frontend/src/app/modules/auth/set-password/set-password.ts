
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-set-password',
    templateUrl: './set-password.html',
    styleUrls: ['./set-password.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SetPasswordComponent implements OnInit {
    passwordForm!: FormGroup;
    hidePassword = true;
    hideConfirmPassword = true;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.passwordForm = this.fb.group({
            newPassword: ['', [
                Validators.required,
                Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/)
            ]],
            confirmPassword: ['', Validators.required]
        }, { validator: this.passwordMatchValidator });
    }

    get hasMinLength(): boolean {
        const password = this.passwordForm.get('newPassword')?.value;
        return password && password.length >= 8;
    }

    get hasUpperCase(): boolean {
        const password = this.passwordForm.get('newPassword')?.value;
        return password && /[A-Z]/.test(password);
    }

    get hasLowerCase(): boolean {
        const password = this.passwordForm.get('newPassword')?.value;
        return password && /[a-z]/.test(password);
    }

    get hasNumber(): boolean {
        const password = this.passwordForm.get('newPassword')?.value;
        return password && /[0-9]/.test(password);
    }

    get hasSpecialChar(): boolean {
        const password = this.passwordForm.get('newPassword')?.value;
        return password && /[@#$%^&+=]/.test(password);
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('newPassword')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    onSubmit(): void {
        if (this.passwordForm.invalid) {
            return;
        }

        this.loading = true;
        const token = this.authService.getToken();

        if (!token) {
            this.toastr.error('Session expired. Please login again.');
            this.router.navigate(['/login']);
            this.loading = false;
            this.cdr.markForCheck();
            return;
        }

        this.authService.setPassword({ newPassword: this.passwordForm.get('newPassword')?.value })
            .subscribe({
                next: () => {
                    this.loading = false;
                    this.authService.markPasswordResetComplete();
                    this.toastr.success('Password updated successfully!');
                    const user = this.authService.getUser();
                    this.router.navigate([user?.role === 'SUPPLIER' ? '/supplier/products' : '/dashboard']);
                    this.cdr.markForCheck();
                },
                error: (error: any) => {
                    this.loading = false;
                    this.toastr.error(error.error?.message || 'Failed to update password');
                    this.cdr.markForCheck();
                }
            });
    }
}
