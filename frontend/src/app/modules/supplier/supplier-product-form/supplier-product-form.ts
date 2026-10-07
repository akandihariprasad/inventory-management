import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SupplierService } from '../../../core/services/supplier.service';

@Component({
  selector: 'app-supplier-product-form',
  templateUrl: './supplier-product-form.html',
  styleUrls: ['./supplier-product-form.css'],
  standalone: false
})
export class SupplierProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  productId: number | null = null;
  loading = false;

  categories = ['Electronics', 'Accessories', 'Furniture', 'Clothing', 'Groceries', 'Other'];
  units = ['Pieces', 'Kg', 'Gram', 'Liter', 'Meter', 'Box', 'Pack'];

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      category: [''],
      unit: ['Pieces', Validators.required],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      availableQty: [0, [Validators.min(0)]]
    });
  }

  checkEditMode(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        this.loadProduct();
      }
    });
  }

  loadProduct(): void {
    this.loading = true;
    this.supplierService.getSupplierProductById(this.productId!).subscribe({
      next: (response) => {
        const product = response.data;
        this.productForm.patchValue({
          name: product.name,
          description: product.description || '',
          category: product.category || '',
          unit: product.unit || 'Pieces',
          unitPrice: product.unitPrice,
          availableQty: product.availableQty
        });
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error(error.error?.message || 'Failed to load product');
        this.router.navigate(['/supplier/products']);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    this.loading = true;
    const request = this.productForm.value;

    if (this.isEditMode) {
      this.supplierService.updateSupplierProduct(this.productId!, request).subscribe({
        next: () => {
          this.loading = false;
          this.toastr.success('Product updated successfully');
          this.router.navigate(['/supplier/products']);
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error(error.error?.message || 'Failed to update product');
        }
      });
    } else {
      this.supplierService.addSupplierProduct(request).subscribe({
        next: () => {
          this.loading = false;
          this.toastr.success('Product added successfully');
          this.router.navigate(['/supplier/products']);
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error(error.error?.message || 'Failed to add product');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/supplier/products']);
  }
}