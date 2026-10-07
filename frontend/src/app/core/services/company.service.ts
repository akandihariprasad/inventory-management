
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CompanyRequest, DepartmentRequest } from '../models/company.model';

@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    constructor(private api: ApiService) { }

    getProfile(): Observable<any> {
        return this.api.get('/company/profile');
    }

    updateProfile(request: CompanyRequest): Observable<any> {
        return this.api.put('/company/profile', request);
    }

    getDepartments(): Observable<any> {
        return this.api.get('/company/departments');
    }

    addDepartment(request: DepartmentRequest): Observable<any> {
        return this.api.post('/company/departments', request);
    }

    updateDepartment(departmentId: number, request: DepartmentRequest): Observable<any> {
        return this.api.put(`/company/departments/${departmentId}`, request);
    }

    deleteDepartment(departmentId: number): Observable<any> {
        return this.api.delete(`/company/departments/${departmentId}`);
    }
}