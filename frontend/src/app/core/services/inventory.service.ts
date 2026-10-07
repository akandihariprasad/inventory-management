
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ProductRequest, StockMovementRequest } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    constructor(private api: ApiService) { }

    getProducts(): Observable<any> {
        return this.api.get('/inventory/products');
    }

    getProductById(productId: number): Observable<any> {
        return this.api.get(`/inventory/products/${productId}`);
    }

    addProduct(request: ProductRequest): Observable<any> {
        return this.api.post('/inventory/products', request);
    }

    updateProduct(productId: number, request: ProductRequest): Observable<any> {
        return this.api.put(`/inventory/products/${productId}`, request);
    }

    deleteProduct(productId: number): Observable<any> {
        return this.api.delete(`/inventory/products/${productId}`);
    }

    getLowStockProducts(): Observable<any> {
        return this.api.get('/inventory/products/low-stock');
    }

    adjustStock(request: StockMovementRequest): Observable<any> {
        return this.api.post('/inventory/stock/adjust', request);
    }

    getProductMovements(productId: number): Observable<any> {
        return this.api.get(`/inventory/stock/movements/product/${productId}`);
    }

    getAllMovements(): Observable<any> {
        return this.api.get('/inventory/stock/movements');
    }
}