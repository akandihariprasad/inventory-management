
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { StaffService } from '../../../core/services/staff.service';

@Component({
    selector: 'app-staff-list',
    templateUrl: './staff-list.html',
    styleUrls: ['./staff-list.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StaffListComponent implements OnInit {
    staffList: any[] = [];
    loading = false;
    displayedColumns: string[] = ['name', 'email', 'role', 'department', 'status', 'actions'];

    constructor(
        private staffService: StaffService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadStaff();
    }

    loadStaff(): void {
        this.loading = true;
        this.cdr.markForCheck();
        this.staffService.getAllStaff().subscribe({
            next: (response) => {
                this.staffList = response.data;
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.loading = false;
                this.cdr.markForCheck();
                this.toastr.error(error.error?.message || 'Failed to load staff');
            }
        });
    }

    toggleStatus(staff: any): void {
        const newStatus = !staff.isActive;
        const action = newStatus ? 'activate' : 'deactivate';

        if (confirm(`Are you sure you want to ${action} ${staff.name}?`)) {
            this.staffService.updateStaffStatus(staff.id, newStatus).subscribe({
                next: () => {
                    this.cdr.markForCheck();
                    this.toastr.success(`Staff ${action}d successfully`);
                    this.loadStaff();
                },
                error: (error) => {
                    this.cdr.markForCheck();
                    this.toastr.error(error.error?.message || `Failed to ${action} staff`);
                }
            });
        }
    }
}