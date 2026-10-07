
export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    createdAt: Date;
}

export interface CustomerRequest {
    name: string;
    email: string;
    phone: string;
    address: string;
}

export interface SaleItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export interface SalesOrderRequest {
    customerId: number;
    discount: number;
    paymentMode: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER';
    items: SaleItem[];
}

export interface SalesOrderResponse {
    id: number;
    customerId: number;
    customerName: string;
    totalAmount: number;
    discount: number;
    finalAmount: number;
    paymentMode: string;
    status: string;
    createdAt: Date;
    items: SaleItem[];
}