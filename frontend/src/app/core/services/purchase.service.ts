
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PurchaseRequest, DeliveryRequest } from '../models/purchase.model';

@Injectable({
    providedIn: 'root'
})
export class PurchaseService {
    private purchaseRequestCache = new Map<number, any>();

    constructor(private api: ApiService) { }

    createPurchaseRequest(request: PurchaseRequest): Observable<any> {
        return this.api.post('/purchase-requests', request);
    }

    getCompanyPurchaseRequests(): Observable<any> {
        return this.api.get('/purchase-requests/company');
    }

    getPurchaseRequestById(id: number): Observable<any> {
        return this.api.get(`/purchase-requests/${id}`);
    }

    getCachedPurchaseRequest(id: number): any | null {
        return this.purchaseRequestCache.get(id) || null;
    }

    cachePurchaseRequest(purchaseRequest: any): void {
        if (purchaseRequest?.id) {
            this.purchaseRequestCache.set(purchaseRequest.id, purchaseRequest);
        }
    }

    approvePurchaseRequest(id: number): Observable<any> {
        return this.api.patch(`/purchase-requests/${id}/approve`, {});
    }

    rejectPurchaseRequest(id: number, rejectionReason: string): Observable<any> {
        return this.api.patch(`/purchase-requests/${id}/reject`, { rejectionReason });
    }

    dispatchPurchaseRequest(id: number): Observable<any> {
        return this.api.patch(`/purchase-requests/${id}/dispatch`, {});
    }

    deliverPurchaseRequest(id: number, request: DeliveryRequest): Observable<any> {
        return this.api.patch(`/purchase-requests/${id}/deliver`, request);
    }
}
