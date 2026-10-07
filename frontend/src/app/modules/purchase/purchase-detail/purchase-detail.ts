import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PurchaseService } from '../../../core/services/purchase.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-purchase-detail',
    templateUrl: './purchase-detail.html',
    styleUrls: ['./purchase-detail.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PurchaseDetailComponent implements OnInit {
    purchaseRequest: any = null;
    loading = false;
    isSupplier = false;
    isWorker = false;

    constructor(
        private route: ActivatedRoute,
        private purchaseService: PurchaseService,
        private authService: AuthService,
        private router: Router,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.checkUserRole();
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.loadPurchaseRequest(id);
            }
        });
    }

    checkUserRole(): void {
        const user = this.authService.getUser();
        this.isSupplier = user?.role === 'SUPPLIER';
        this.isWorker = user?.role === 'WORKER' || user?.role === 'MANAGER';
    }

    loadPurchaseRequest(id: number): void {
        const cachedPurchaseRequest = this.purchaseService.getCachedPurchaseRequest(Number(id));
        if (cachedPurchaseRequest) {
            this.purchaseRequest = cachedPurchaseRequest;
        }

        this.loading = !cachedPurchaseRequest;
        this.cdr.markForCheck();

        this.purchaseService.getPurchaseRequestById(id).subscribe({
            next: (response) => {
                this.purchaseRequest = response.data;
                this.purchaseService.cachePurchaseRequest(this.purchaseRequest);
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.loading = false;
                this.toastr.error(error.error?.message || 'Failed to load purchase request');
                this.cdr.markForCheck();

                if (!cachedPurchaseRequest) {
                    this.goBack();
                }
            }
        });
    }

    approveRequest(): void {
        if (confirm('Are you sure you want to approve this purchase request?')) {
            this.purchaseService.approvePurchaseRequest(this.purchaseRequest.id).subscribe({
                next: () => {
                    this.toastr.success('Purchase request approved');
                    this.loadPurchaseRequest(this.purchaseRequest.id);
                },
                error: (error) => {
                    this.toastr.error(error.error?.message || 'Failed to approve request');
                }
            });
        }
    }

    rejectRequest(): void {
        const reason = prompt('Please enter rejection reason:');
        if (reason) {
            this.purchaseService.rejectPurchaseRequest(this.purchaseRequest.id, reason).subscribe({
                next: () => {
                    this.toastr.success('Purchase request rejected');
                    this.loadPurchaseRequest(this.purchaseRequest.id);
                },
                error: (error) => {
                    this.toastr.error(error.error?.message || 'Failed to reject request');
                }
            });
        }
    }

    dispatchOrder(): void {
        if (confirm('Mark this order as dispatched?')) {
            this.purchaseService.dispatchPurchaseRequest(this.purchaseRequest.id).subscribe({
                next: () => {
                    this.toastr.success('Order marked as dispatched');
                    this.loadPurchaseRequest(this.purchaseRequest.id);
                },
                error: (error) => {
                    this.toastr.error(error.error?.message || 'Failed to dispatch order');
                }
            });
        }
    }

    deliverOrder(): void {
        const receivedQuantities: { [key: string]: number } = {};

        this.purchaseRequest.items.forEach((item: any) => {
            const qty = prompt(`Enter received quantity for ${item.productName} (Requested: ${item.requestedQty}):`, item.requestedQty.toString());
            if (qty && !isNaN(Number(qty))) {
                receivedQuantities[item.supplierProductId] = Number(qty);
            }
        });

        if (Object.keys(receivedQuantities).length > 0) {
            this.purchaseService.deliverPurchaseRequest(this.purchaseRequest.id, {
                receivedQuantities,
                notes: 'Delivery completed'
            }).subscribe({
                next: () => {
                    this.toastr.success('Delivery completed and stock updated');
                    this.loadPurchaseRequest(this.purchaseRequest.id);
                },
                error: (error) => {
                    this.toastr.error(error.error?.message || 'Failed to deliver order');
                }
            });
        }
    }

    getStatusClass(status: string): string {
        const statusMap: any = {
            'PENDING': 'status-pending',
            'APPROVED': 'status-approved',
            'DISPATCHED': 'status-dispatched',
            'DELIVERED': 'status-delivered',
            'REJECTED': 'status-rejected'
        };
        return statusMap[status] || 'status-pending';
    }

    canApprove(): boolean {
        return this.isSupplier && this.purchaseRequest?.status === 'PENDING';
    }

    canReject(): boolean {
        return this.isSupplier && this.purchaseRequest?.status === 'PENDING';
    }

    canDispatch(): boolean {
        return this.isSupplier && this.purchaseRequest?.status === 'APPROVED';
    }

    canDeliver(): boolean {
        return this.isWorker && this.purchaseRequest?.status === 'DISPATCHED';
    }

    goBack(): void {
        this.router.navigate([this.isSupplier ? '/supplier/purchase-requests' : '/purchase-requests']);
    }
}
