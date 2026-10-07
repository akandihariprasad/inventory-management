import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PurchaseService } from '../../../core/services/purchase.service';
import { SupplierService } from '../../../core/services/supplier.service';

@Component({
    selector: 'app-create-purchase',
    templateUrl: './create-purchase.html',
    styleUrls: ['./create-purchase.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CreatePurchaseComponent implements OnInit {
    purchaseForm!: FormGroup;
    suppliers: any[] = [];
    supplierProducts: any[] = [];
    loading = false;
    selectedSupplierId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private purchaseService: PurchaseService,
        private supplierService: SupplierService,
        private router: Router,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadSuppliers();
    }

    initForm(): void {
        this.purchaseForm = this.fb.group({
            supplierId: ['', Validators.required],
            deliveryNotes: [''],
            items: this.fb.array([])
        });

        this.purchaseForm.get('supplierId')?.valueChanges.subscribe(supplierId => {
            if (supplierId) {
                this.selectedSupplierId = supplierId;
                this.loadSupplierProducts(supplierId);
                this.clearItems();
            }
        });
    }

    get items(): FormArray {
        return this.purchaseForm.get('items') as FormArray;
    }

    get itemGroups(): FormGroup[] {
        return this.items.controls as FormGroup[];
    }

    addItem(): void {
        const itemForm = this.fb.group({
            supplierProductId: ['', Validators.required],
            productName: [''],
            requestedQty: [1, [Validators.required, Validators.min(1)]],
            unitPrice: [0, Validators.required],
            availableQty: [0]
        });

        itemForm.get('supplierProductId')?.valueChanges.subscribe(productId => {
            const product = this.supplierProducts.find(p => p.id === Number(productId));
            if (product) {
                itemForm.patchValue({
                    productName: product.name,
                    unitPrice: product.unitPrice,
                    availableQty: product.availableQty
                });
            }
        });

        this.items.push(itemForm);
    }

    removeItem(index: number): void {
        this.items.removeAt(index);
    }

    clearItems(): void {
        while (this.items.length) {
            this.items.removeAt(0);
        }
        this.addItem();
    }

    loadSuppliers(): void {
        this.loading = true;
        this.supplierService.getAllSuppliers().subscribe({
            next: (response) => {
                this.suppliers = response.data || [];
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.loading = false;
                this.toastr.error('Failed to load suppliers');
                this.cdr.markForCheck();
            }
        });
    }

    loadSupplierProducts(supplierId: number): void {
        this.supplierService.getSupplierCatalog(supplierId).subscribe({
            next: (response) => {
                this.supplierProducts = this.supplierService.getSupplierCatalogProducts(response);
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.toastr.error('Failed to load supplier products');
                this.cdr.markForCheck();
            }
        });
    }

    calculateTotal(): number {
        let total = 0;
        this.items.controls.forEach(item => {
            const quantity = item.get('requestedQty')?.value || 0;
            const price = item.get('unitPrice')?.value || 0;
            total += quantity * price;
        });
        return total;
    }

    onSubmit(): void {
        if (this.purchaseForm.invalid) {
            this.toastr.error('Please fill all required fields');
            return;
        }

        if (this.items.length === 0) {
            this.toastr.error('Please add at least one item');
            return;
        }

        const requestData = {
            supplierId: this.purchaseForm.get('supplierId')?.value,
            deliveryNotes: this.purchaseForm.get('deliveryNotes')?.value,
            items: this.items.value.map((item: any) => ({
                supplierProductId: item.supplierProductId,
                productName: item.productName,
                requestedQty: item.requestedQty,
                unitPrice: item.unitPrice
            }))
        };

        this.loading = true;
        this.purchaseService.createPurchaseRequest(requestData).subscribe({
            next: () => {
                this.loading = false;
                this.toastr.success('Purchase request created successfully');
                this.router.navigate(['/purchase-requests']);
            },
            error: (error) => {
                this.loading = false;
                this.toastr.error(error.error?.message || 'Failed to create purchase request');
            }
        });
    }
}
