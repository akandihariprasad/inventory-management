
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
    selector: 'app-add-product',
    templateUrl: './add-product.html',
    styleUrls: ['./add-product.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AddProductComponent implements OnInit {
    productForm!: FormGroup;
    isEditMode = false;
    productId: number | null = null;
    loading = false;

    categories = [
        'Electronics', 'Accessories', 'Clothing', 'Furniture', 'Groceries', 'Other'
    ];

    units = [
        'Pieces', 'Kg', 'Gram', 'Liter', 'Meter', 'Box', 'Pack'
    ];

    constructor(
        private fb: FormBuilder,
        private inventoryService: InventoryService,
        private route: ActivatedRoute,
        private router: Router,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.checkEditMode();
    }

    initForm(): void {
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            category: [''],
            unit: ['Pieces'],
            unitPrice: [0, [Validators.required, Validators.min(0)]],
            sellingPrice: [0, [Validators.required, Validators.min(0)]],
            currentStock: [0, [Validators.min(0)]],
            minimumStockLevel: [5, [Validators.min(0)]],
            imageUrl: ['']
        });
    }

    checkEditMode(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.productId = params['id'];
                this.loadProduct();
            }
        });
    }

    loadProduct(): void {
        this.loading = true;
        this.cdr.markForCheck();
        this.inventoryService.getProductById(this.productId!).subscribe({
            next: (response) => {
                this.productForm.patchValue(response.data);
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.loading = false;
                this.cdr.markForCheck();
                this.toastr.error(error.error?.message || 'Failed to load product');
            }
        });
    }

    onSubmit(): void {
        if (this.productForm.invalid) {
            return;
        }

        this.loading = true;
        this.cdr.markForCheck();
        const request = this.productForm.value;

        if (this.isEditMode) {
            this.inventoryService.updateProduct(this.productId!, request).subscribe({
                next: () => {
                    this.loading = false;
                    this.cdr.markForCheck();
                    this.toastr.success('Product updated successfully');
                    this.router.navigate(['/inventory']);
                },
                error: (error) => {
                    this.loading = false;
                    this.cdr.markForCheck();
                    this.toastr.error(error.error?.message || 'Failed to update product');
                }
            });
        } else {
            this.inventoryService.addProduct(request).subscribe({
                next: () => {
                    this.loading = false;
                    this.toastr.success('Product added successfully');
                    this.router.navigate(['/inventory']);
                },
                error: (error) => {
                    this.loading = false;
                    this.toastr.error(error.error?.message || 'Failed to add product');
                }
            });
        }
    }
}