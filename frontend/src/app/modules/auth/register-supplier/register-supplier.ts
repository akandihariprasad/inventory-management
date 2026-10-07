
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-register-supplier',
    templateUrl: './register-supplier.html',
    styleUrls: ['./register-supplier.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class RegisterSupplierComponent implements OnInit {
    registerForm!: FormGroup;
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
        this.registerForm = this.fb.group({
            supplierName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [
                Validators.required,
                Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8}$/)
            ]],
            confirmPassword: ['', Validators.required],
            phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
            businessAddress: ['', Validators.required],
            productCategories: ['']
        }, { validator: this.passwordMatchValidator });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            return;
        }

        this.loading = true;
        const { confirmPassword, ...requestData } = this.registerForm.value;

        this.authService.registerSupplier(requestData)
            .subscribe({
                next: (response) => {
                    this.loading = false;
                    this.toastr.success('Supplier registration successful!');
                    if (response.isPasswordResetRequired) {
                        this.router.navigate(['/set-password']);
                    } else {
                        this.router.navigate(['/supplier/products']);
                    }
                },
                error: (error) => {
                    this.loading = false;
                    this.toastr.error(error.error?.message || 'Registration failed');
                }
            });
    }
}
