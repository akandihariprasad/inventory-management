
export interface Company {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    gstNumber: string;
    logoUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CompanyRequest {
    name: string;
    email: string;
    phone: string;
    address: string;
    gstNumber: string;
    logoUrl: string;
}

export interface Department {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
}

export interface DepartmentRequest {
    name: string;
    description: string;
}