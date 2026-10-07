import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';
import { ReportService } from '../../core/services/report.service';
import { SupplierService } from '../../core/services/supplier.service';
import { User } from '../../core/models/user.model';
import { catchError, forkJoin, of, Subscription } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy {
    currentUser: User | null = null;
    dashboardData: any = null;
    salesData: any[] = [];
    topProducts: any[] = [];
    isSupplier = false;
    loading = false;
    supplierProducts: any[] = [];
    supplierOrders: any[] = [];
    private userSubscription: Subscription | null = null;
    private loadedRole: string | null = null;

    salesChartData: ChartConfiguration<'line'>['data'] = {
        labels: [],
        datasets: [
            {
                data: [],
                label: 'Sales',
                tension: 0.35,
                fill: true,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)'
            }
        ]
    };

    topProductsChartData: ChartConfiguration<'bar'>['data'] = {
        labels: [],
        datasets: [
            {
                data: [],
                label: 'Quantity Sold',
                backgroundColor: '#4caf50',
                borderRadius: 8
            }
        ]
    };

    chartOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' }
        }
    };

    barChartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' }
        }
    };

    constructor(
        private authService: AuthService,
        private reportService: ReportService,
        private supplierService: SupplierService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.userSubscription = this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            this.isSupplier = user?.role === 'SUPPLIER';

            if (user && this.loadedRole !== user.role) {
                this.loadedRole = user.role;
                this.resetDashboardState();

                if (this.isSupplier) {
                    this.loadSupplierDashboard();
                } else {
                    this.loadDashboardData();
                    this.loadChartData();
                }
            }

            this.cdr.markForCheck();
        });
    }

    ngOnDestroy(): void {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    private resetDashboardState(): void {
        this.dashboardData = null;
        this.salesData = [];
        this.topProducts = [];
        this.supplierProducts = [];
        this.supplierOrders = [];
    }

    loadSupplierDashboard(): void {
        this.loading = true;
        this.cdr.markForCheck();

        forkJoin({
            products: this.supplierService.getSupplierProducts().pipe(catchError(() => of({ data: [] }))),
            orders: this.supplierService.getIncomingPurchaseRequests().pipe(catchError(() => of({ data: [] })))
        }).subscribe({
            next: ({ products, orders }) => {
                this.supplierProducts = products.data || [];
                this.supplierOrders = orders.data || [];
                this.dashboardData = {
                    totalProducts: this.supplierProducts.length,
                    lowStockCount: this.supplierProducts.filter(p => p.availableQty < 10).length,
                    pendingPurchaseOrders: this.supplierOrders.filter(o => o.status === 'PENDING').length,
                    todaySalesCount: 0,
                    todaySalesRevenue: 0,
                    totalCustomers: 0
                };
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    loadDashboardData(): void {
        this.loading = true;
        this.cdr.markForCheck();

        this.reportService.getDashboard().subscribe({
            next: (response) => {
                this.dashboardData = response.data;
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.loading = false;
                this.cdr.markForCheck();
                this.dashboardData = {
                    totalProducts: 0,
                    lowStockCount: 0,
                    pendingPurchaseOrders: 0,
                    todaySalesCount: 0,
                    todaySalesRevenue: 0,
                    totalCustomers: 0
                };
            }
        });
    }

    loadChartData(): void {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);

        this.reportService.getSalesSummary(this.formatDate(startDate), this.formatDate(endDate)).subscribe({
            next: (response) => {
                this.salesData = response.data || [];
                this.updateSalesChart();
                this.cdr.markForCheck();
            },
            error: () => {
                this.salesData = [];
                this.cdr.markForCheck();
            }
        });

        this.reportService.getTopProducts(5).subscribe({
            next: (response) => {
                this.topProducts = response.data || [];
                this.updateTopProductsChart();
                this.cdr.markForCheck();
            },
            error: () => {
                this.topProducts = [];
                this.cdr.markForCheck();
            }
        });
    }

    updateSalesChart(): void {
        this.salesChartData = {
            labels: this.salesData.map(item => item.date || ''),
            datasets: [
                {
                    data: this.salesData.map(item => item.totalRevenue || 0),
                    label: 'Revenue (INR)',
                    tension: 0.35,
                    fill: true,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)'
                }
            ]
        };
    }

    updateTopProductsChart(): void {
        this.topProductsChartData = {
            labels: this.topProducts.map(item => item.productName || ''),
            datasets: [
                {
                    data: this.topProducts.map(item => item.totalQuantitySold || 0),
                    label: 'Quantity Sold',
                    backgroundColor: '#4caf50',
                    borderRadius: 8
                }
            ]
        };
    }

    private formatDate(date: Date): string {
        return date.toISOString().slice(0, 10);
    }
}
