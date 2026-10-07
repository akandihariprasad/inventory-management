// import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
// import { MatTableDataSource } from '@angular/material/table';
// import { Router } from '@angular/router';
// import { ToastrService } from 'ngx-toastr';
// import { SalesService } from '../../../core/services/sales.service';

// @Component({
//     //     selector: 'app-sale-list',
//     templateUrl: './sale-list.html',
//     styleUrls: ['./sale-list.css'],
//     changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class SaleListComponent implements OnInit, AfterViewInit {
//     displayedColumns: string[] = ['id', 'customerName', 'totalAmount', 'finalAmount', 'paymentMode', 'createdAt', 'actions'];
//     dataSource = new MatTableDataSource<any>([]);
//     loading = false;
//     searchText = '';

//     @ViewChild(MatPaginator) paginator!: MatPaginator;
//     @ViewChild(MatSort) sort!: MatSort;

//     constructor(
//         private salesService: SalesService,
//         private router: Router,
//         private toastr: ToastrService,
//         private cdr: ChangeDetectorRef
//     ) { }

//     ngOnInit(): void {
//         this.loadSalesOrders();
//     }

//     ngAfterViewInit(): void {
//         this.dataSource.paginator = this.paginator;
//         this.dataSource.sort = this.sort;
//     }

//     loadSalesOrders(): void {
//         this.loading = true;
//         this.cdr.markForCheck();
//         this.salesService.getSalesOrders().subscribe({
//             next: (response) => {
//                 this.dataSource.data = response.data;
//                 this.loading = false;
//                 this.cdr.markForCheck();
//             },
//             error: (error) => {
//                 this.loading = false;
//                 this.cdr.markForCheck();
//                 this.toastr.error(error.error?.message || 'Failed to load sales orders');
//             }
//         });
//     }

//     applyFilter(): void {
//         this.dataSource.filter = this.searchText.trim().toLowerCase();
//     }

//     viewInvoice(orderId: number): void {
//         this.router.navigate(['/sales/invoice', orderId]);
//     }

//     printInvoice(orderId: number): void {
//         window.open(`/sales/invoice/${orderId}`, '_blank');
//     }
// }




import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SalesService } from '../../../core/services/sales.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-sale-list',
    templateUrl: './sale-list.html',
    styleUrls: ['./sale-list.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SaleListComponent implements OnInit, AfterViewInit, OnDestroy {
    displayedColumns: string[] = ['id', 'customerName', 'totalAmount', 'finalAmount', 'paymentMode', 'createdAt', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    loading = false;
    searchText = '';
    private destroy$ = new Subject<void>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private salesService: SalesService,
        private router: Router,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadSalesOrders();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.cdr.markForCheck();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadSalesOrders(): void {
        this.loading = true;
        this.cdr.markForCheck();

        this.salesService.getSalesOrders()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    console.log('Sales orders loaded:', response);
                    this.dataSource.data = response.data || [];
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading sales orders:', error);
                    this.loading = false;
                    this.cdr.markForCheck();
                    this.toastr.error(error.error?.message || 'Failed to load sales orders');
                }
            });
    }

    applyFilter(): void {
        this.dataSource.filter = this.searchText.trim().toLowerCase();
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
        this.cdr.markForCheck();
    }

    viewInvoice(orderId: number): void {
        // Navigate to invoice page in the same tab (standard behavior)
        this.router.navigate(['/sales/invoice', orderId]);
    }

    printInvoice(orderId: number): void {
        // Open in a new tab and trigger print dialog
        const printWindow = window.open(`/sales/invoice/${orderId}?print=true`, '_blank');
        if (printWindow) {
            // Wait for content to load then print
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    }

    refreshData(): void {
        this.loadSalesOrders();
        this.toastr.info('Refreshing sales data...');
    }
}
