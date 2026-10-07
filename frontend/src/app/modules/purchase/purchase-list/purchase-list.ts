import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { PurchaseService } from '../../../core/services/purchase.service';
import { SupplierService } from '../../../core/services/supplier.service';

@Component({
    selector: 'app-purchase-list',
    templateUrl: './purchase-list.html',
    styleUrls: ['./purchase-list.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PurchaseListComponent implements OnInit, AfterViewInit, OnDestroy {
    displayedColumns: string[] = ['id', 'counterpartyName', 'totalAmount', 'status', 'createdAt', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    loading = false;
    searchText = '';
    isSupplier = false;
    private destroy$ = new Subject<void>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private authService: AuthService,
        private purchaseService: PurchaseService,
        private supplierService: SupplierService,
        private router: Router,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.isSupplier = this.authService.getUser()?.role === 'SUPPLIER';
        this.configureTable();
        this.loadPurchaseRequests();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (item, property) => {
            if (property === 'counterpartyName') {
                return this.getCounterpartyName(item).toLowerCase();
            }
            return item[property];
        };
        this.cdr.markForCheck();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadPurchaseRequests(): void {
        this.loading = true;
        this.cdr.markForCheck();

        const request$ = this.isSupplier
            ? this.supplierService.getIncomingPurchaseRequests()
            : this.purchaseService.getCompanyPurchaseRequests();

        request$
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    const purchaseRequests = response.data || [];
                    purchaseRequests.forEach((request: any) => this.purchaseService.cachePurchaseRequest(request));
                    this.dataSource.data = purchaseRequests;
                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    this.loading = false;
                    this.toastr.error(error.error?.message || 'Failed to load purchase requests');
                    this.cdr.markForCheck();
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

    viewDetails(purchaseRequest: any): void {
        if (!purchaseRequest?.id) {
            this.toastr.error('Purchase order details are unavailable');
            return;
        }

        this.purchaseService.cachePurchaseRequest(purchaseRequest);
        this.router.navigate(['/purchase-requests', purchaseRequest.id]);
    }

    getCounterpartyName(purchaseRequest: any): string {
        return this.isSupplier
            ? purchaseRequest.companyName || '-'
            : purchaseRequest.supplierName || '-';
    }

    getCounterpartyLabel(): string {
        return this.isSupplier ? 'Company' : 'Supplier';
    }

    getListTitle(): string {
        return this.isSupplier ? 'Incoming Purchase Orders' : 'Purchase Requests';
    }

    getStatusClass(status: string): string {
        const statusMap: any = {
            PENDING: 'status-pending',
            APPROVED: 'status-approved',
            DISPATCHED: 'status-dispatched',
            DELIVERED: 'status-delivered',
            REJECTED: 'status-rejected'
        };
        return statusMap[status] || 'status-pending';
    }

    refreshData(): void {
        this.loadPurchaseRequests();
        this.toastr.info('Refreshing purchase requests...');
    }

    private configureTable(): void {
        this.dataSource.filterPredicate = (purchaseRequest, filter) => {
            const searchableText = [
                purchaseRequest.id,
                purchaseRequest.status,
                purchaseRequest.totalAmount,
                this.getCounterpartyName(purchaseRequest)
            ].join(' ').toLowerCase();

            return searchableText.includes(filter);
        };
    }
}
