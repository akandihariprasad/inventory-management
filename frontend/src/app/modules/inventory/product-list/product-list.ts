
import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.html',
    styleUrls: ['./product-list.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ProductListComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = ['name', 'sku', 'category', 'currentStock', 'unitPrice', 'sellingPrice', 'status', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    loading = false;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private inventoryService: InventoryService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    loadProducts(): void {
        this.loading = true;
        this.cdr.markForCheck();
        this.inventoryService.getProducts().subscribe({
            next: (response) => {
                this.dataSource.data = response.data;
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.loading = false;
                this.cdr.markForCheck();
                this.toastr.error(error.error?.message || 'Failed to load products');
            }
        });
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    deleteProduct(product: any): void {
        if (confirm(`Are you sure you want to delete ${product.name}?`)) {
            this.inventoryService.deleteProduct(product.id).subscribe({
                next: () => {
                    this.cdr.markForCheck();
                    this.toastr.success('Product deleted successfully');
                    this.loadProducts();
                },
                error: (error) => {
                    this.cdr.markForCheck();
                    this.toastr.error(error.error?.message || 'Failed to delete product');
                }
            });
        }
    }

    adjustStock(product: any): void {
        const quantity = prompt(`Enter quantity to add for ${product.name}:`);
        if (quantity && !isNaN(Number(quantity))) {
            this.inventoryService.adjustStock({
                productId: product.id,
                type: 'STOCK_IN',
                quantity: Number(quantity),
                notes: 'Manual stock adjustment'
            }).subscribe({
                next: () => {
                    this.cdr.markForCheck();
                    this.toastr.success('Stock updated successfully');
                    this.loadProducts();
                },
                error: (error) => {
                    this.cdr.markForCheck();
                    this.toastr.error(error.error?.message || 'Failed to update stock');
                }
            });
        }
    }
}