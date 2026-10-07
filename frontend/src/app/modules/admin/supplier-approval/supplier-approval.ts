import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { SupplierService } from '../../../core/services/supplier.service';


@Component({
  selector: 'app-supplier-approval',
  templateUrl: './supplier-approval.html',
  styleUrls: ['./supplier-approval.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SupplierApprovalComponent implements OnInit {
  displayedColumns: string[] = ['companyName', 'email', 'phone', 'address', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private supplierService: SupplierService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadPendingSuppliers();
  }

  loadPendingSuppliers(): void {
    this.loading = true;
    this.supplierService.getPendingSuppliers().subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error(error.error?.message || 'Failed to load suppliers');
      }
    });
  }

  approveSupplier(supplierId: number): void {
    if (confirm('Are you sure you want to approve this supplier?')) {
      this.supplierService.approveSupplier(supplierId).subscribe({
        next: () => {
          this.toastr.success('Supplier approved successfully');
          this.loadPendingSuppliers();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Failed to approve supplier');
        }
      });
    }
  }

  rejectSupplier(supplierId: number): void {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      this.supplierService.rejectSupplier(supplierId, reason).subscribe({
        next: () => {
          this.toastr.success('Supplier rejected');
          this.loadPendingSuppliers();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Failed to reject supplier');
        }
      });
    }
  }
}
