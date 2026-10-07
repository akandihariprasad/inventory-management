import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
    selector: 'app-stock-movements',
    templateUrl: './stock-movements.html',
    styleUrls: ['./stock-movements.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StockMovementsComponent implements OnInit {
    displayedColumns: string[] = ['productName', 'type', 'quantity', 'referenceType', 'notes', 'performedByName', 'createdAt'];
    dataSource = new MatTableDataSource<any>([]);
    loading = false;
    filterForm!: FormGroup;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    movementTypes = [
        { value: 'STOCK_IN', label: 'Stock In' },
        { value: 'STOCK_OUT', label: 'Stock Out' },
        { value: 'ADJUSTMENT', label: 'Adjustment' },
        { value: 'RETURN', label: 'Return' }
    ];

    constructor(
        private inventoryService: InventoryService,
        private fb: FormBuilder,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.initFilterForm();
        this.loadMovements();
    }

    initFilterForm(): void {
        this.filterForm = this.fb.group({
            type: [''],
            startDate: [''],
            endDate: ['']
        });
    }

    loadMovements(): void {
        this.loading = true;
        this.inventoryService.getAllMovements().subscribe({
            next: (response) => {
                this.dataSource.data = response.data;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.toastr.error(error.error?.message || 'Failed to load stock movements');
            }
        });
    }

    applyFilter(): void {
        const filters = this.filterForm.value;
        let filteredData = [...this.dataSource.data];

        if (filters.type) {
            filteredData = filteredData.filter(item => item.type === filters.type);
        }

        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            filteredData = filteredData.filter(item => new Date(item.createdAt) >= startDate);
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            filteredData = filteredData.filter(item => new Date(item.createdAt) <= endDate);
        }

        this.dataSource.data = filteredData;
    }

    resetFilter(): void {
        this.filterForm.reset();
        this.loadMovements();
    }

    getTypeClass(type: string): string {
        const classes: any = {
            'STOCK_IN': 'type-in',
            'STOCK_OUT': 'type-out',
            'ADJUSTMENT': 'type-adjustment',
            'RETURN': 'type-return'
        };
        return classes[type] || '';
    }
}