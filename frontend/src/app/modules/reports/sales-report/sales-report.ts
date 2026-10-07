import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../../../core/services/report.service';

@Component({
    selector: 'app-sales-report',
    templateUrl: './sales-report.html',
    styleUrls: ['./sales-report.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SalesReportComponent implements OnInit {
    filterForm!: FormGroup;
    salesData: any[] = [];
    loading = false;
    displayedColumns: string[] = ['date', 'totalOrders', 'totalRevenue', 'totalItemsSold'];

    constructor(
        private fb: FormBuilder,
        private reportService: ReportService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadReport();
    }

    initForm(): void {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        this.filterForm = this.fb.group({
            startDate: [startDate.toISOString().split('T')[0]],
            endDate: [endDate.toISOString().split('T')[0]]
        });
    }

    loadReport(): void {
        const { startDate, endDate } = this.filterForm.value;

        if (!startDate || !endDate) {
            this.toastr.error('Please select both start and end dates');
            return;
        }

        this.loading = true;
        this.cdr.detectChanges();

        this.reportService.getSalesSummary(startDate, endDate).subscribe({
            next: (response) => {
                this.salesData = [...(response.data || [])];
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.loading = false;
                this.toastr.error(error.error?.message || 'Failed to load sales report');
                this.cdr.detectChanges();
            }
        });
    }

    exportToCSV(): void {
        // Implementation for CSV export
        this.toastr.info('Export functionality coming soon');
    }
}
