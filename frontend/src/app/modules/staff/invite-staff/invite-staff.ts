import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StaffService } from '../../../core/services/staff.service';
import { CompanyService } from '../../../core/services/company.service';

@Component({
    selector: 'app-invite-staff',
    templateUrl: './invite-staff.html',
    styleUrls: ['./invite-staff.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class InviteStaffComponent implements OnInit {
    inviteForm!: FormGroup;
    departments: any[] = [];
    loading = false;
    roles = [
        { value: 'MANAGER', label: 'Manager' },
        { value: 'WORKER', label: 'Worker' }
    ];

    constructor(
        private fb: FormBuilder,
        private staffService: StaffService,
        private companyService: CompanyService,
        private router: Router,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadDepartments();
    }

    initForm(): void {
        this.inviteForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            role: ['', Validators.required],
            departmentId: [null]
        });
    }

    loadDepartments(): void {
        this.companyService.getDepartments().subscribe({
            next: (response) => {
                this.departments = response.data || [];
                this.cdr.markForCheck();
            },
            error: () => {
                this.toastr.error('Failed to load departments');
                this.cdr.markForCheck();
            }
        });
    }

    onSubmit(): void {
        if (this.inviteForm.invalid) {
            // Mark all fields as touched to show validation errors
            Object.keys(this.inviteForm.controls).forEach(key => {
                const control = this.inviteForm.get(key);
                control?.markAsTouched();
            });
            this.toastr.error('Please fill all required fields');
            return;
        }

        this.loading = true;
        this.staffService.inviteStaff(this.inviteForm.value).subscribe({
            next: () => {
                this.loading = false;
                this.toastr.success('Staff invited successfully! An email has been sent with temporary password.');
                this.router.navigate(['/staff']);
            },
            error: (error) => {
                this.loading = false;
                this.toastr.error(error.error?.message || 'Failed to invite staff');
                this.cdr.markForCheck();
            }
        });
    }
}
