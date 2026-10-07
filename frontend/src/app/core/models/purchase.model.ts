
export interface PurchaseRequestItem {
    supplierProductId: number;
    productName: string;
    requestedQty: number;
    unitPrice: number;
}

export interface PurchaseRequest {
    supplierId: number;
    deliveryNotes: string;
    items: PurchaseRequestItem[];
}

export interface PurchaseRequestResponse {
    id: number;
    companyId: number;
    companyName: string;
    supplierId: number;
    supplierName: string;
    status: 'PENDING' | 'APPROVED' | 'DISPATCHED' | 'DELIVERED' | 'REJECTED';
    totalAmount: number;
    rejectionReason: string;
    deliveryNotes: string;
    dispatchedAt: Date;
    deliveredAt: Date;
    createdAt: Date;
    updatedAt: Date;
    items: PurchaseRequestItem[];
}

export interface DeliveryRequest {
    receivedQuantities: { [key: string]: number };
    notes: string;
}