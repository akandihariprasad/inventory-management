
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrls: ['./login.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    hidePassword = true;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.cdr.markForCheck();
        this.authService.login(this.loginForm.value)
            .subscribe({
                next: (response) => {
                    this.loading = false;
                    this.cdr.markForCheck();
                    this.toastr.success('Login successful!');
                    if (response.isPasswordResetRequired) {
                        this.router.navigate(['/set-password']);
                    } else if (response.role === 'SUPPLIER') {
                        this.router.navigate(['/supplier/products']);
                    } else {
                        this.router.navigate(['/dashboard']);
                    }
                },
                error: (error) => {
                    this.loading = false;
                    this.toastr.error(error.error?.message || 'Login failed');
                }
            });
    }
}
