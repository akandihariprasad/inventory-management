import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ReportService } from '../../../core/services/report.service';

@Component({
    selector: 'app-dashboard-report',
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DashboardReportComponent implements OnInit {
    salesData: any[] = [];
    loading = false;

    public salesChartData: ChartConfiguration<'line'>['data'] = {
        labels: [],
        datasets: [
            {
                data: [],
                label: 'Revenue (INR)',
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    public orderChartData: ChartConfiguration<'bar'>['data'] = {
        labels: [],
        datasets: [
            {
                data: [],
                label: 'Number of Orders',
                backgroundColor: '#4caf50',
                borderColor: '#388e3c',
                borderWidth: 1
            }
        ]
    };

    public chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'top' }
        }
    };

    public barChartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'top' }
        }
    };

    constructor(
        private reportService: ReportService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.cdr.markForCheck();

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        this.reportService.getSalesSummary(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        ).subscribe({
            next: (response) => {
                this.salesData = response.data || [];
                this.updateCharts();
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.salesData = [];
                this.updateCharts();
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    updateCharts(): void {
        this.salesChartData = {
            labels: this.salesData.map(item => item.date || ''),
            datasets: [{
                data: this.salesData.map(item => item.totalRevenue || 0),
                label: 'Revenue (INR)',
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4
            }]
        };

        this.orderChartData = {
            labels: this.salesData.map(item => item.date || ''),
            datasets: [{
                data: this.salesData.map(item => item.totalOrders || 0),
                label: 'Number of Orders',
                backgroundColor: '#4caf50',
                borderColor: '#388e3c',
                borderWidth: 1
            }]
        };
    }
}
