import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { SupplierService } from '../../../core/services/supplier.service';

@Component({
  selector: 'app-supplier-sales-report',
  templateUrl: './supplier-sales-report.html',
  styleUrls: ['./supplier-sales-report.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SupplierSalesReportComponent implements OnInit {
  orders: any[] = [];
  loading = false;
  totalRevenue = 0;
  totalOrders = 0;
  displayedColumns: string[] = ['id', 'companyName', 'totalAmount', 'status', 'createdAt'];

  constructor(
    private supplierService: SupplierService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.supplierService.getSupplierSalesReport()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.orders = this.getRecords(response, ['orders', 'sales', 'purchaseOrders', 'items']);
          this.totalOrders = response?.data?.totalOrders ?? response?.totalOrders ?? this.orders.length;
          this.totalRevenue = response?.data?.totalRevenue ?? response?.totalRevenue ?? this.orders.reduce((sum, order) => sum + (order.totalAmount || order.finalAmount || 0), 0);
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Failed to load sales report');
        }
      });
  }

  getCompanyName(order: any): string {
    return order.companyName || order.company?.name || order.customerName || '-';
  }

  getTotalAmount(order: any): number {
    return order.totalAmount || order.finalAmount || 0;
  }

  getOrderDate(order: any): string | Date {
    return order.createdAt || order.orderDate || order.date;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'DELIVERED': return 'status-delivered';
      case 'APPROVED': return 'status-approved';
      case 'PENDING': return 'status-pending';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  }

  private getRecords(response: any, keys: string[]): any[] {
    if (Array.isArray(response)) {
      return [...response];
    }

    if (Array.isArray(response?.data)) {
      return [...response.data];
    }

    for (const key of keys) {
      if (Array.isArray(response?.data?.[key])) {
        return [...response.data[key]];
      }

      if (Array.isArray(response?.[key])) {
        return [...response[key]];
      }
    }

    return [];
  }
}
