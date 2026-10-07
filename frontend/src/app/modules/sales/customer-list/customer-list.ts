import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SalesService } from '../../../core/services/sales.service';

@Component({
    selector: 'app-customer-list',
    templateUrl: './customer-list.html',
    styleUrls: ['./customer-list.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CustomerListComponent implements OnInit {
    displayedColumns: string[] = ['name', 'email', 'phone', 'address', 'createdAt', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    loading = false;
    showAddForm = false;
    customerForm!: FormGroup;
    searchText = '';

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private salesService: SalesService,
        private fb: FormBuilder,
        private dialog: MatDialog,
        private router: Router,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadCustomers();
    }

    initForm(): void {
        this.customerForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.email]],
            phone: ['', Validators.pattern(/^[0-9]{10}$/)],
            address: ['']
        });
    }

    loadCustomers(): void {
        this.loading = true;
        this.salesService.getCustomers().subscribe({
            next: (response) => {
                this.dataSource.data = response.data;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.toastr.error(error.error?.message || 'Failed to load customers');
            }
        });
    }

    applyFilter(): void {
        this.dataSource.filter = this.searchText.trim().toLowerCase();
    }

    openAddForm(): void {
        this.showAddForm = true;
        this.customerForm.reset();
    }

    cancelAdd(): void {
        this.showAddForm = false;
        this.customerForm.reset();
    }

    addCustomer(): void {
        if (this.customerForm.invalid) {
            return;
        }

        this.loading = true;
        this.salesService.addCustomer(this.customerForm.value).subscribe({
            next: () => {
                this.loading = false;
                this.toastr.success('Customer added successfully');
                this.showAddForm = false;
                this.customerForm.reset();
                this.loadCustomers();
            },
            error: (error) => {
                this.loading = false;
                this.toastr.error(error.error?.message || 'Failed to add customer');
            }
        });
    }

    selectCustomer(customer: any): void {
        this.router.navigate(['/sales/create'], {
            queryParams: { customerId: customer.id }
        });
    }
}
