import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { SupplierService } from '../../../core/services/supplier.service';

@Component({
  selector: 'app-supplier-customers',
  templateUrl: './supplier-customers.html',
  styleUrls: ['./supplier-customers.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SupplierCustomersComponent implements OnInit {
  customers: any[] = [];
  loading = false;
  displayedColumns: string[] = ['companyName', 'email', 'phone', 'since'];

  constructor(
    private supplierService: SupplierService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.supplierService.getSupplierCustomers()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.customers = this.getRecords(response, ['customers', 'connections', 'items'])
            .filter((customer: any) => !customer.status || customer.status === 'ACCEPTED');
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Failed to load customers');
        }
      });
  }

  getCompanyName(customer: any): string {
    return customer.companyName || customer.company?.name || customer.name || '-';
  }

  getEmail(customer: any): string {
    return customer.email || customer.company?.email || '-';
  }

  getPhone(customer: any): string {
    return customer.phone || customer.company?.phone || '-';
  }

  getConnectedDate(customer: any): string | Date {
    return customer.createdAt || customer.connectedAt || customer.acceptedAt;
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
