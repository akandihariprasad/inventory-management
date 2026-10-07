
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    constructor(private api: ApiService) { }

    getDashboard(): Observable<any> {
        return this.api.get('/reports/dashboard');
    }

    getInventorySummary(): Observable<any> {
        return this.api.get('/reports/inventory-summary');
    }

    getStockMovements(startDate: string, endDate: string): Observable<any> {
        return this.api.get('/reports/stock-movements', { startDate, endDate });
    }

    getSalesSummary(startDate: string, endDate: string): Observable<any> {
        return this.api.get('/reports/sales-summary', { startDate, endDate });
    }

    getPurchaseSummary(startDate: string, endDate: string): Observable<any> {
        return this.api.get('/reports/purchase-summary', { startDate, endDate });
    }

    getLowStockAlerts(): Observable<any> {
        return this.api.get('/reports/low-stock-alerts');
    }

    getTopProducts(limit: number = 10): Observable<any> {
        return this.api.get('/reports/top-products', { limit });
    }

    // Export endpoints
    exportSalesReport(startDate: string, endDate: string): Observable<Blob> {
        return this.api.get(`/export/sales/csv?startDate=${startDate}&endDate=${endDate}`);
    }

    exportInventoryReport(): Observable<Blob> {
        return this.api.get('/export/inventory/csv');
    }
}






