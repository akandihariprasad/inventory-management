
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
    templateUrl: './status-badge.html',
    styleUrls: ['./status-badge.css'],
  standalone: false
})
export class StatusBadgeComponent {
    @Input() status: string = '';
    @Input() size: 'small' | 'medium' | 'large' = 'medium';

    getStatusClass(): string {
        const statusMap: { [key: string]: string } = {
            'PENDING': 'status-pending',
            'APPROVED': 'status-approved',
            'DISPATCHED': 'status-dispatched',
            'DELIVERED': 'status-delivered',
            'REJECTED': 'status-rejected',
            'ACCEPTED': 'status-accepted',
            'ACTIVE': 'status-active',
            'INACTIVE': 'status-inactive',
            'COMPLETED': 'status-completed',
            'CANCELLED': 'status-cancelled',
            'LOW_STOCK': 'status-low-stock',
            'OUT_OF_STOCK': 'status-out-stock'
        };
        return statusMap[this.status] || 'status-default';
    }

    getStatusLabel(): string {
        const labelMap: { [key: string]: string } = {
            'PENDING': 'Pending',
            'APPROVED': 'Approved',
            'DISPATCHED': 'Dispatched',
            'DELIVERED': 'Delivered',
            'REJECTED': 'Rejected',
            'ACCEPTED': 'Accepted',
            'ACTIVE': 'Active',
            'INACTIVE': 'Inactive',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Cancelled',
            'LOW_STOCK': 'Low Stock',
            'OUT_OF_STOCK': 'Out of Stock'
        };
        return labelMap[this.status] || this.status;
    }
}