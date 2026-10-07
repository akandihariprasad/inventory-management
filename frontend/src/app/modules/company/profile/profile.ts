
// import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ToastrService } from 'ngx-toastr';
// import { CompanyService } from '../../../core/services/company.service';
// import { AuthService } from '../../../core/services/auth.service';

// @Component({
//     //     selector: 'app-profile',
//     templateUrl: './profile.html',
//     styleUrls: ['./profile.css'],
//     changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class ProfileComponent implements OnInit {
//     profileForm!: FormGroup;
//     loading = false;
//     companyId: number | null = null;

//     constructor(
//         private fb: FormBuilder,
//         private companyService: CompanyService,
//         private authService: AuthService,
//         private toastr: ToastrService,
//         private cdr: ChangeDetectorRef
//     ) { }

//     ngOnInit(): void {
//         this.initForm();
//         this.loadProfile();
//     }

//     initForm(): void {
//         this.profileForm = this.fb.group({
//             name: ['', Validators.required],
//             email: ['', [Validators.required, Validators.email]],
//             phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
//             address: [''],
//             gstNumber: [''],
//             logoUrl: ['']
//         });
//     }

//     loadProfile(): void {
//         this.loading = true;
//         this.cdr.markForCheck();
//         this.companyService.getProfile().subscribe({
//             next: (response) => {
//                 this.profileForm.patchValue(response.data);
//                 this.loading = false;
//                 this.cdr.markForCheck();
//             },
//             error: (error) => {
//                 this.loading = false;
//                 this.cdr.markForCheck();
//                 this.toastr.error(error.error?.message || 'Failed to load profile');
//             }
//         });
//     }

//     onSubmit(): void {
//         if (this.profileForm.invalid) {
//             return;
//         }

//         this.loading = true;
//         this.cdr.markForCheck();
//         this.companyService.updateProfile(this.profileForm.value).subscribe({
//             next: () => {
//                 this.loading = false;
//                 this.cdr.markForCheck();
//                 this.toastr.success('Profile updated successfully');
//             },
//             error: (error) => {
//                 this.loading = false;
//                 this.cdr.markForCheck();
//                 this.toastr.error(error.error?.message || 'Failed to update profile');
//             }
//         });
//     }
// }





import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from '../../../core/services/company.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.html',
    styleUrls: ['./profile.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ProfileComponent implements OnInit {
    profileForm!: FormGroup;
    loading = false;
    isEditMode = false;
    companyData: any = null;

    constructor(
        private fb: FormBuilder,
        private companyService: CompanyService,
        private authService: AuthService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadProfile();
    }

    initForm(): void {
        this.profileForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
            address: [''],
            gstNumber: [''],
            logoUrl: ['']
        });
    }

    loadProfile(): void {
        this.loading = true;
        this.cdr.markForCheck();
        this.companyService.getProfile().subscribe({
            next: (response) => {
                this.companyData = response.data;
                this.profileForm.patchValue(response.data);
                this.profileForm.disable();
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.loading = false;
                this.cdr.markForCheck();
                this.toastr.error(error.error?.message || 'Failed to load profile');
            }
        });
    }

    enableEdit(): void {
        this.isEditMode = true;
        this.profileForm.enable();
        this.cdr.markForCheck();
    }

    cancelEdit(): void {
        this.isEditMode = false;
        this.profileForm.patchValue(this.companyData);
        this.profileForm.disable();
        this.cdr.markForCheck();
    }

    onSubmit(): void {
        if (this.profileForm.invalid) {
            this.toastr.error('Please fill all required fields');
            return;
        }

        this.loading = true;
        this.cdr.markForCheck();
        this.companyService.updateProfile(this.profileForm.value).subscribe({
            next: (response) => {
                this.loading = false;
                this.companyData = response.data;
                this.isEditMode = false;
                this.profileForm.disable();
                this.cdr.markForCheck();
                this.toastr.success('Profile updated successfully');
            },
            error: (error) => {
                this.loading = false;
                this.cdr.markForCheck();
                this.toastr.error(error.error?.message || 'Failed to update profile');
            }
        });
    }
}
