import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { SupplierService } from '../../../core/services/supplier.service';

@Component({
    selector: 'app-supplier-list',
    templateUrl: './supplier-list.html',
    styleUrls: ['./supplier-list.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SupplierListComponent implements OnInit {
    suppliers: any[] = [];
    private allSuppliers: any[] = [];
    loading = false;
    catalogLoadingSupplierId: number | null = null;
    displayedColumns: string[] = ['companyName', 'email', 'phone', 'status', 'actions'];

    constructor(
        private supplierService: SupplierService,
        private router: Router,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadSuppliers();
    }

    loadSuppliers(): void {
        this.loading = true;
        this.cdr.markForCheck();

        this.supplierService.getAllSuppliers().subscribe({
            next: (response) => {
                this.allSuppliers = response.data || [];
                this.suppliers = [...this.allSuppliers];
                this.prefetchVisibleCatalogs();
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.loading = false;
                this.toastr.error(error.error?.message || 'Failed to load suppliers');
                this.cdr.markForCheck();
            }
        });
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

        this.suppliers = this.allSuppliers.filter(supplier => {
            const companyName = (supplier.companyName || '').toLowerCase();
            const email = (supplier.email || '').toLowerCase();
            const phone = (supplier.phone || '').toLowerCase();
            return companyName.includes(filterValue) || email.includes(filterValue) || phone.includes(filterValue);
        });

        this.cdr.markForCheck();
    }

    prefetchCatalog(supplier: any): void {
        const supplierId = this.getSupplierId(supplier);
        if (!supplierId) {
            return;
        }

        this.supplierService.prefetchSupplierCatalog(supplierId);
    }

    viewCatalog(supplier: any): void {
        const supplierId = this.getSupplierId(supplier);
        if (!supplierId) {
            this.toastr.error('Unable to open this supplier catalog');
            return;
        }

        const cachedProducts = this.supplierService.getCachedSupplierCatalog(supplierId);
        if (cachedProducts) {
            this.openCatalog(supplierId, cachedProducts);
            return;
        }

        this.catalogLoadingSupplierId = supplierId;
        this.cdr.markForCheck();

        this.supplierService.getSupplierCatalog(supplierId).pipe(
            finalize(() => {
                this.catalogLoadingSupplierId = null;
                this.cdr.markForCheck();
            })
        ).subscribe({
            next: (response) => {
                this.openCatalog(
                    supplierId,
                    this.supplierService.getSupplierCatalogProducts(response)
                );
            },
            error: (error) => {
                this.toastr.error(error.error?.message || 'Failed to load supplier catalog');
            }
        });
    }

    sendConnectionRequest(supplierId: number): void {
        this.supplierService.sendConnectionRequest({ supplierId }).subscribe({
            next: () => {
                this.toastr.success('Connection request sent successfully');
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.toastr.error(error.error?.message || 'Failed to send connection request');
                this.cdr.markForCheck();
            }
        });
    }

    isCatalogLoading(supplier: any): boolean {
        const supplierId = this.getSupplierId(supplier);
        return !!supplierId && this.catalogLoadingSupplierId === supplierId;
    }

    private prefetchVisibleCatalogs(): void {
        this.suppliers
            .slice(0, 10)
            .forEach(supplier => {
                const supplierId = this.getSupplierId(supplier);
                if (supplierId) {
                    this.supplierService.prefetchSupplierCatalog(supplierId);
                }
            });
    }

    private openCatalog(supplierId: number, products: any[]): void {
        this.router.navigate(['/suppliers/catalog', supplierId], {
            state: { products }
        });
    }

    private getSupplierId(supplier: any): number | null {
        const supplierId = Number(supplier?.id ?? supplier?.supplierId ?? supplier?.userId);
        return Number.isFinite(supplierId) && supplierId > 0 ? supplierId : null;
    }
}
