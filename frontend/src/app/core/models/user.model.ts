
export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    companyId: number;
    isActive: boolean;
    isPasswordResetRequired: boolean;
    createdAt: Date;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    userId: number;
    email: string;
    name: string;
    role: string;
    companyId: number;
    isPasswordResetRequired: boolean;
}

export interface RegisterOwnerRequest {
    companyName: string;
    ownerName: string;
    email: string;
    password: string;
    phone: string;
    address: string;
}

export interface RegisterSupplierRequest {
    supplierName: string;
    email: string;
    password: string;
    phone: string;
    businessAddress: string;
    productCategories: string;
}

export interface SetPasswordRequest {
    newPassword: string;
}

export interface StaffInviteRequest {
    name: string;
    email: string;
    role: string;
    departmentId: number;
}

export interface StaffResponse {
    id: number;
    name: string;
    email: string;
    role: string;
    departmentId: number;
    departmentName: string;
    isActive: boolean;
    createdAt: Date;
}