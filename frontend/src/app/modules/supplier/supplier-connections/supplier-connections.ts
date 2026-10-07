
import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { SupplierService } from '../../../core/services/supplier.service';

@Component({
    selector: 'app-supplier-connections',
    templateUrl: './supplier-connections.html',
    styleUrls: ['./supplier-connections.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SupplierConnectionsComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = ['companyName', 'status', 'createdAt', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    loading = false;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private supplierService: SupplierService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadConnections();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    loadConnections(): void {
        this.loading = true;
        this.cdr.markForCheck();
        this.supplierService.getSupplierConnections().subscribe({
            next: (response) => {
                this.dataSource.data = response.data;
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.loading = false;
                this.cdr.markForCheck();
                this.toastr.error(error.error?.message || 'Failed to load connections');
            }
        });
    }

    updateStatus(linkId: number, status: string): void {
        this.supplierService.updateConnectionStatus(linkId, status).subscribe({
            next: () => {
                this.cdr.markForCheck();
                this.toastr.success(`Connection ${status.toLowerCase()} successfully`);
                this.loadConnections();
            },
            error: (error) => {
                this.toastr.error(error.error?.message || 'Failed to update status');
            }
        });
    }

    getStatusClass(status: string): string {
        const classes: any = {
            'PENDING': 'status-pending',
            'ACCEPTED': 'status-accepted',
            'REJECTED': 'status-rejected'
        };
        return classes[status] || '';
    }
}