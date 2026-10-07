
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from '../../../core/services/company.service';

@Component({
    selector: 'app-departments',
    templateUrl: './departments.html',
    styleUrls: ['./departments.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DepartmentsComponent implements OnInit {
    departments: any[] = [];
    departmentForm!: FormGroup;
    showForm = false;
    editingDepartment: any = null;
    loading = false;

    displayedColumns: string[] = ['name', 'description', 'createdAt', 'actions'];

    constructor(
        private fb: FormBuilder,
        private companyService: CompanyService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadDepartments();
    }

    initForm(): void {
        this.departmentForm = this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
    }

    loadDepartments(): void {
        this.loading = true;
        this.cdr.markForCheck();
        this.companyService.getDepartments().subscribe({
            next: (response) => {
                this.departments = response.data;
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.loading = false;
                this.cdr.markForCheck();
                this.toastr.error(error.error?.message || 'Failed to load departments');
            }
        });
    }

    openAddForm(): void {
        this.showForm = true;
        this.editingDepartment = null;
        this.departmentForm.reset();
        this.cdr.markForCheck();
    }

    editDepartment(department: any): void {
        this.showForm = true;
        this.editingDepartment = department;
        this.departmentForm.patchValue(department);
        this.cdr.markForCheck();
    }

    cancelForm(): void {
        this.showForm = false;
        this.editingDepartment = null;
        this.departmentForm.reset();
        this.cdr.markForCheck();
    }

    onSubmit(): void {
        if (this.departmentForm.invalid) {
            return;
        }

        this.loading = true;
        this.cdr.markForCheck();
        const request = this.departmentForm.value;

        if (this.editingDepartment) {
            this.companyService.updateDepartment(this.editingDepartment.id, request).subscribe({
                next: () => {
                    this.loading = false;
                    this.cdr.markForCheck();
                    this.toastr.success('Department updated successfully');
                    this.cancelForm();
                    this.loadDepartments();
                },
                error: (error) => {
                    this.loading = false;
                    this.cdr.markForCheck();
                    this.toastr.error(error.error?.message || 'Failed to update department');
                }
            });
        } else {
            this.companyService.addDepartment(request).subscribe({
                next: () => {
                    this.loading = false;
                    this.cdr.markForCheck();
                    this.toastr.success('Department added successfully');
                    this.cancelForm();
                    this.loadDepartments();
                },
                error: (error) => {
                    this.loading = false;
                    this.cdr.markForCheck();
                    this.toastr.error(error.error?.message || 'Failed to add department');
                }
            });
        }
    }

    deleteDepartment(department: any): void {
        if (confirm(`Are you sure you want to delete ${department.name}?`)) {
            this.companyService.deleteDepartment(department.id).subscribe({
                next: () => {
                    this.cdr.markForCheck();
                    this.toastr.success('Department deleted successfully');
                    this.loadDepartments();
                },
                error: (error) => {
                    this.cdr.markForCheck();
                    this.toastr.error(error.error?.message || 'Failed to delete department');
                }
            });
        }
    }
}






