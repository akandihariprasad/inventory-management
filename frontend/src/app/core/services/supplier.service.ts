import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, shareReplay, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { SupplierProductRequest, ConnectionRequest } from '../models/supplier.model';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private supplierCatalogCache = new Map<number, any[]>();
    private supplierCatalogRequests = new Map<number, Observable<any>>();

    constructor(private api: ApiService) { }

    getSupplierProfile(): Observable<any> {
        return this.api.get('/supplier/profile');
    }

    getSupplierProductById(productId: number): Observable<any> {
        return this.api.get(`/supplier/products/${productId}`);
    }

    updateSupplierProfile(request: any): Observable<any> {
        return this.api.put('/supplier/profile', request);
    }

    getSupplierStockMovements(): Observable<any> {
        return this.api.get('/supplier/stock-movements');
    }

    getSupplierCustomers(): Observable<any> {
        return this.api.get('/supplier/customers');
    }

    getSupplierSalesReport(): Observable<any> {
        return this.api.get('/supplier/sales-report');
    }

    getSupplierProducts(): Observable<any> {
        return this.api.get('/supplier/products');
    }

    addSupplierProduct(request: SupplierProductRequest): Observable<any> {
        return this.api.post('/supplier/products', request);
    }

    updateSupplierProduct(productId: number, request: SupplierProductRequest): Observable<any> {
        return this.api.put(`/supplier/products/${productId}`, request);
    }

    deleteSupplierProduct(productId: number): Observable<any> {
        return this.api.delete(`/supplier/products/${productId}`);
    }

    getSupplierConnections(): Observable<any> {
        return this.api.get('/supplier/connections');
    }

    updateConnectionStatus(linkId: number, status: string): Observable<any> {
        return this.api.patch(`/supplier/connections/${linkId}/status`, { status });
    }

    getIncomingPurchaseRequests(): Observable<any> {
        return this.api.get('/supplier/purchase-requests');
    }

    getAllSuppliers(): Observable<any> {
        return this.api.get('/company/suppliers');
    }

    getSupplierCatalog(supplierId: number): Observable<any> {
        return this.fetchSupplierCatalog(supplierId);
    }

    getSupplierCatalogProducts(response: any): any[] {
        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.data?.products)) {
            return response.data.products;
        }

        if (Array.isArray(response?.products)) {
            return response.products;
        }

        if (Array.isArray(response?.catalog)) {
            return response.catalog;
        }

        return [];
    }

    getCachedSupplierCatalog(supplierId: number): any[] | null {
        return this.supplierCatalogCache.has(supplierId)
            ? this.supplierCatalogCache.get(supplierId)!
            : null;
    }

    prefetchSupplierCatalog(supplierId: number): void {
        if (!supplierId) {
            return;
        }

        if (this.supplierCatalogCache.has(supplierId) || this.supplierCatalogRequests.has(supplierId)) {
            return;
        }

        this.fetchSupplierCatalog(supplierId).subscribe({ error: () => undefined });
    }

    sendConnectionRequest(request: ConnectionRequest): Observable<any> {
        return this.api.post('/company/suppliers/connect', request);
    }

    getCompanyConnections(): Observable<any> {
        return this.api.get('/company/suppliers/connections');
    }

    getPendingSuppliers(): Observable<any> {
        return this.api.get('/admin/suppliers/pending');
    }

    approveSupplier(supplierId: number): Observable<any> {
        return this.api.patch(`/admin/suppliers/${supplierId}/approve`, {});
    }

    rejectSupplier(supplierId: number, reason: string): Observable<any> {
        return this.api.patch(`/admin/suppliers/${supplierId}/reject`, { rejectionReason: reason });
    }

    getAllSuppliersWithStatus(): Observable<any> {
        return this.api.get('/admin/suppliers/all');
    }

    private fetchSupplierCatalog(supplierId: number): Observable<any> {
        const activeRequest = this.supplierCatalogRequests.get(supplierId);
        if (activeRequest) {
            return activeRequest;
        }

        const request = this.api.get(`/company/suppliers/${supplierId}/catalog`).pipe(
            tap((response: any) => this.supplierCatalogCache.set(
                supplierId,
                this.getSupplierCatalogProducts(response)
            )),
            finalize(() => this.supplierCatalogRequests.delete(supplierId)),
            shareReplay(1)
        );

        this.supplierCatalogRequests.set(supplierId, request);
        return request;
    }
}
