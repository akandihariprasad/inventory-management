import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../../../core/services/report.service';

@Component({
    selector: 'app-inventory-report',
    templateUrl: './inventory-report.html',
    styleUrls: ['./inventory-report.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class InventoryReportComponent implements OnInit {
    inventoryData: any[] = [];
    loading = false;
    displayedColumns: string[] = ['productName', 'sku', 'currentStock', 'minimumStockLevel', 'status'];

    constructor(
        private reportService: ReportService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadInventoryReport();
    }

    loadInventoryReport(): void {
        this.loading = true;
        this.cdr.detectChanges();

        this.reportService.getInventorySummary().subscribe({
            next: (response) => {
                this.inventoryData = [...(response.data || [])];
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.loading = false;
                this.toastr.error(error.error?.message || 'Failed to load inventory report');
                this.cdr.detectChanges();
            }
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'LOW_STOCK': return 'status-low';
            case 'OUT_OF_STOCK': return 'status-out';
            default: return 'status-healthy';
        }
    }
}
