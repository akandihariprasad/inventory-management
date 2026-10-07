






import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SupplierService } from '../../../core/services/supplier.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-supplier-products',
    templateUrl: './supplier-products.html',
    styleUrls: ['./supplier-products.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SupplierProductsComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = ['name', 'category', 'unit', 'unitPrice', 'availableQty', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    loading = false;
    showForm = false;
    editingProduct: any = null;
    productForm!: FormGroup;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    categories = ['Electronics', 'Accessories', 'Furniture', 'Clothing', 'Groceries', 'Other'];
    units = ['Pieces', 'Kg', 'Gram', 'Liter', 'Meter', 'Box', 'Pack'];

    constructor(
        private supplierService: SupplierService,
        private fb: FormBuilder,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadProducts();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    initForm(): void {
        this.productForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            description: ['', Validators.maxLength(500)],
            category: [''],
            unit: ['Pieces', Validators.required],
            unitPrice: [0, [Validators.required, Validators.min(0)]],
            availableQty: [0, [Validators.min(0)]]
        });
    }

    loadProducts(): void {
        this.loading = true;
        this.cdr.markForCheck();

        this.supplierService.getSupplierProducts()
            .pipe(finalize(() => {
                this.loading = false;
                this.cdr.markForCheck();
            }))
            .subscribe({
                next: (response) => {
                    this.dataSource.data = response.data || [];
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    this.toastr.error(error.error?.message || 'Failed to load products');
                    this.cdr.markForCheck();
                }
            });
    }

    openAddForm(): void {
        this.showForm = true;
        this.editingProduct = null;
        this.productForm.reset({
            name: '',
            description: '',
            category: '',
            unit: 'Pieces',
            unitPrice: 0,
            availableQty: 0
        });
        this.cdr.markForCheck();
    }

    editProduct(product: any): void {
        this.showForm = true;
        this.editingProduct = product;
        this.productForm.patchValue({
            name: product.name,
            description: product.description || '',
            category: product.category || '',
            unit: product.unit || 'Pieces',
            unitPrice: product.unitPrice,
            availableQty: product.availableQty
        });
        this.cdr.markForCheck();
    }

    cancelForm(): void {
        this.showForm = false;
        this.editingProduct = null;
        this.productForm.reset({
            name: '',
            description: '',
            category: '',
            unit: 'Pieces',
            unitPrice: 0,
            availableQty: 0
        });
        this.cdr.markForCheck();
    }

    onSubmit(): void {
        if (this.productForm.invalid) {
            if (this.productForm.get('name')?.hasError('required')) {
                this.toastr.error('Product name is required');
            } else if (this.productForm.get('unitPrice')?.hasError('required')) {
                this.toastr.error('Unit price is required');
            } else if (this.productForm.get('unitPrice')?.hasError('min')) {
                this.toastr.error('Unit price cannot be negative');
            } else if (this.productForm.get('availableQty')?.hasError('min')) {
                this.toastr.error('Available quantity cannot be negative');
            } else {
                this.toastr.error('Please fill all required fields correctly');
            }
            return;
        }

        this.loading = true;
        this.cdr.markForCheck();
        const request = this.productForm.value;

        if (this.editingProduct) {
            this.supplierService.updateSupplierProduct(this.editingProduct.id, request)
                .pipe(finalize(() => {
                    this.loading = false;
                    this.cdr.markForCheck();
                }))
                .subscribe({
                    next: () => {
                        this.toastr.success('Product updated successfully');
                        this.cancelForm();
                        this.loadProducts();
                        this.cdr.markForCheck();
                    },
                    error: (error) => {
                        this.toastr.error(error.error?.message || 'Failed to update product');
                        this.cdr.markForCheck();
                    }
                });
        } else {
            this.supplierService.addSupplierProduct(request)
                .pipe(finalize(() => {
                    this.loading = false;
                    this.cdr.markForCheck();
                }))
                .subscribe({
                    next: () => {
                        this.toastr.success('Product added successfully');
                        this.cancelForm();
                        this.loadProducts();
                        this.cdr.markForCheck();
                    },
                    error: (error) => {
                        this.toastr.error(error.error?.message || 'Failed to add product');
                        this.cdr.markForCheck();
                    }
                });
        }
    }

    deleteProduct(product: any): void {
        if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
            this.loading = true;
            this.cdr.markForCheck();

            this.supplierService.deleteSupplierProduct(product.id)
                .pipe(finalize(() => {
                    this.loading = false;
                    this.cdr.markForCheck();
                }))
                .subscribe({
                    next: () => {
                        this.toastr.success('Product deleted successfully');
                        this.loadProducts();
                        this.cdr.markForCheck();
                    },
                    error: (error) => {
                        this.toastr.error(error.error?.message || 'Failed to delete product');
                        this.cdr.markForCheck();
                    }
                });
        }
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
        this.cdr.markForCheck();
    }
}
