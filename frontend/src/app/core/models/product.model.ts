
export interface Product {
    id: number;
    name: string;
    description: string;
    sku: string;
    category: string;
    unit: string;
    unitPrice: number;
    sellingPrice: number;
    currentStock: number;
    minimumStockLevel: number;
    isLowStock: boolean;
    imageUrl: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductRequest {
    name: string;
    description?: string;
    category?: string;
    unit?: string;
    unitPrice: number;
    sellingPrice: number;
    currentStock?: number;
    minimumStockLevel?: number;
    imageUrl?: string;
}

export interface StockMovementRequest {
    productId: number;
    type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'RETURN';
    quantity: number;
    notes: string;
}

export interface StockMovementResponse {
    id: number;
    productId: number;
    productName: string;
    type: string;
    quantity: number;
    referenceType: string;
    notes: string;
    performedByName: string;
    createdAt: Date;
}