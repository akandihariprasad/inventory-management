import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { SupplierService } from '../../../core/services/supplier.service';

@Component({
  selector: 'app-supplier-stock-movements',
  templateUrl: './supplier-stock-movements.html',
  styleUrls: ['./supplier-stock-movements.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SupplierStockMovementsComponent implements OnInit {
  movements: any[] = [];
  loading = false;
  displayedColumns: string[] = ['productName', 'type', 'quantity', 'date', 'notes'];

  constructor(
    private supplierService: SupplierService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.supplierService.getSupplierStockMovements()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.movements = this.getRecords(response, ['movements', 'stockMovements', 'items']);
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Failed to load stock movements');
        }
      });
  }

  getProductName(movement: any): string {
    return movement.productName || movement.product?.name || movement.supplierProductName || '-';
  }

  getMovementType(movement: any): string {
    return movement.type || movement.movementType || movement.transactionType || '';
  }

  getMovementDate(movement: any): string | Date {
    return movement.createdAt || movement.date || movement.movementDate || movement.updatedAt;
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
