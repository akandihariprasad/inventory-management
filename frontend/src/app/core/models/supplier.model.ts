
export interface Supplier {
    id: number;
    userId: number;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    gstNumber: string;
    website: string;
    contactPerson: string;
    contactPersonPhone: string;
    isVerified: boolean;
    createdAt: Date;
}

export interface SupplierProduct {
    id: number;
    name: string;
    description: string;
    unit: string;
    unitPrice: number;
    availableQty: number;
    category: string;
    createdAt: Date;
}

export interface SupplierProductRequest {
    name: string;
    description?: string;
    unit: string;
    unitPrice: number;
    availableQty: number;
    category?: string;
}

export interface ConnectionRequest {
    supplierId: number;
}

export interface ConnectionResponse {
    id: number;
    companyId: number;
    companyName: string;
    supplierId: number;
    supplierName: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: Date;
    updatedAt: Date;
}