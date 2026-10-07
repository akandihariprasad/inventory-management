import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SalesService } from '../../../core/services/sales.service';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
    selector: 'app-create-sale',
    templateUrl: './create-sale.html',
    styleUrls: ['./create-sale.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CreateSaleComponent implements OnInit {
    saleForm!: FormGroup;
    customers: any[] = [];
    products: any[] = [];
    loading = false;
    paymentModes = [
        { value: 'CASH', label: 'Cash' },
        { value: 'CARD', label: 'Card' },
        { value: 'UPI', label: 'UPI' },
        { value: 'BANK_TRANSFER', label: 'Bank Transfer' }
    ];

    constructor(
        private fb: FormBuilder,
        private salesService: SalesService,
        private inventoryService: InventoryService,
        private router: Router,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadCustomers();
        this.loadProducts();
    }

    initForm(): void {
        this.saleForm = this.fb.group({
            customerId: ['', Validators.required],
            discount: [0, [Validators.min(0)]],
            paymentMode: ['CASH', Validators.required],
            items: this.fb.array([])
        });
        this.addItem();
    }

    get items(): FormArray {
        return this.saleForm.get('items') as FormArray;
    }

    get itemGroups(): FormGroup[] {
        return this.items.controls as FormGroup[];
    }

    addItem(): void {
        const itemForm = this.fb.group({
            productId: ['', Validators.required],
            productName: [''],
            quantity: [1, [Validators.required, Validators.min(1)]],
            unitPrice: [0, Validators.required],
            availableStock: [0]
        });

        itemForm.get('productId')?.valueChanges.subscribe(productId => {
            const product = this.products.find(p => p.id === Number(productId));
            if (product) {
                itemForm.patchValue({
                    productName: product.name,
                    unitPrice: product.sellingPrice,
                    availableStock: product.currentStock
                });
            }
        });

        this.items.push(itemForm);
    }

    removeItem(index: number): void {
        this.items.removeAt(index);
    }

    loadCustomers(): void {
        this.salesService.getCustomers().subscribe({
            next: (response) => {
                this.customers = response.data;
            },
            error: (error) => {
                this.toastr.error('Failed to load customers');
            }
        });
    }

    loadProducts(): void {
        this.inventoryService.getProducts().subscribe({
            next: (response) => {
                this.products = response.data.filter((p: any) => p.currentStock > 0);
            },
            error: (error) => {
                this.toastr.error('Failed to load products');
            }
        });
    }

    calculateTotal(): number {
        let total = 0;
        this.items.controls.forEach(item => {
            const quantity = item.get('quantity')?.value || 0;
            const price = item.get('unitPrice')?.value || 0;
            total += quantity * price;
        });
        return total;
    }

    calculateFinalTotal(): number {
        const total = this.calculateTotal();
        const discount = this.saleForm.get('discount')?.value || 0;
        return total - discount;
    }

    onSubmit(): void {
        if (this.saleForm.invalid) {
            this.toastr.error('Please fill all required fields');
            return;
        }

        // Validate stock availability
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items.at(i);
            const product = this.products.find(p => p.id === item.get('productId')?.value);
            const quantity = item.get('quantity')?.value;

            if (product && quantity > product.currentStock) {
                this.toastr.error(`Insufficient stock for ${product.name}. Available: ${product.currentStock}`);
                return;
            }
        }

        const orderData = {
            customerId: this.saleForm.get('customerId')?.value,
            discount: this.saleForm.get('discount')?.value,
            paymentMode: this.saleForm.get('paymentMode')?.value,
            items: this.items.value.map((item: any) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            }))
        };

        this.loading = true;
        this.salesService.createSalesOrder(orderData).subscribe({
            next: (response) => {
                this.loading = false;
                this.toastr.success('Sale completed successfully');
                this.router.navigate(['/sales/invoice', response.data.id]);
            },
            error: (error) => {
                this.loading = false;
                this.toastr.error(error.error?.message || 'Failed to create sale');
            }
        });
    }
}
