import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SupplierService } from '../../../core/services/supplier.service';

@Component({
    selector: 'app-supplier-catalog',
    templateUrl: './supplier-catalog.html',
    styleUrls: ['./supplier-catalog.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SupplierCatalogComponent implements OnInit {
    supplierId: number | null = null;
    products: any[] = [];
    loading = false;
    displayedColumns: string[] = ['name', 'category', 'unit', 'unitPrice', 'availableQty'];

    constructor(
        private route: ActivatedRoute,
        private supplierService: SupplierService,
        private router: Router,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.supplierId = Number(params['id']);
            if (this.supplierId) {
                this.loadSupplierCatalog();
            } else {
                this.toastr.error('Invalid supplier catalog');
                this.router.navigate(['/suppliers']);
            }
        });
    }

    loadSupplierCatalog(): void {
        const navigationProducts = this.getNavigationProducts();
        const cachedProducts = navigationProducts || this.supplierService.getCachedSupplierCatalog(this.supplierId!);

        if (cachedProducts) {
            this.products = cachedProducts;
            this.loading = false;
            this.cdr.markForCheck();
        } else {
            this.loading = true;
            this.cdr.markForCheck();
        }

        this.supplierService.getSupplierCatalog(this.supplierId!).subscribe({
            next: (response) => {
                this.products = this.supplierService.getSupplierCatalogProducts(response);
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.loading = false;
                this.toastr.error(error.error?.message || 'Failed to load supplier catalog');
                this.cdr.markForCheck();

                if (!cachedProducts) {
                    this.router.navigate(['/suppliers']);
                }
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/suppliers']);
    }

    private getNavigationProducts(): any[] | null {
        const navigationState = this.router.getCurrentNavigation()?.extras.state;
        const historyState = history.state;
        const products = navigationState?.['products'] || historyState?.products;

        return Array.isArray(products) ? products : null;
    }
}
