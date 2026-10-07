import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CustomerRequest, SalesOrderRequest } from '../models/sales.model';

@Injectable({
    providedIn: 'root'
})
export class SalesService {
    constructor(private api: ApiService) { }

    // Customer endpoints
    getCustomers(): Observable<any> {
        return this.api.get('/sales/customers');
    }

    addCustomer(request: CustomerRequest): Observable<any> {
        return this.api.post('/sales/customers', request);
    }

    // Sales order endpoints
    getSalesOrders(): Observable<any> {
        return this.api.get('/sales/orders');
    }

    getSalesOrderById(orderId: number): Observable<any> {
        console.log('Fetching sales order by ID:', orderId);
        return this.api.get(`/sales/orders/${orderId}`);
    }

    createSalesOrder(request: SalesOrderRequest): Observable<any> {
        return this.api.post('/sales/orders', request);
    }

    getInvoice(orderId: number): Observable<any> {
        return this.api.get(`/sales/orders/${orderId}/invoice`);
    }
}