
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { StaffInviteRequest } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class StaffService {
    constructor(private api: ApiService) { }

    inviteStaff(request: StaffInviteRequest): Observable<any> {
        return this.api.post('/admin/staff/invite', request);
    }

    getAllStaff(): Observable<any> {
        return this.api.get('/admin/staff');
    }

    getStaffById(staffId: number): Observable<any> {
        return this.api.get(`/admin/staff/${staffId}`);
    }

    updateStaffStatus(staffId: number, isActive: boolean): Observable<any> {
        return this.api.patch(`/admin/staff/${staffId}/status`, { isActive });
    }
}