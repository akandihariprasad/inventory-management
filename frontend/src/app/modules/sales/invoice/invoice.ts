// import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { ToastrService } from 'ngx-toastr';
// import { SalesService } from '../../../core/services/sales.service';

// @Component({
//     //     selector: 'app-invoice',
//     templateUrl: './invoice.html',
//     styleUrls: ['./invoice.css'],
//     changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class InvoiceComponent implements OnInit {
//     order: any = null;
//     loading = false;
//     orderId: number | null = null;

//     constructor(
//         private route: ActivatedRoute,
//         private salesService: SalesService,
//         private router: Router,
//         private toastr: ToastrService,
//         private cdr: ChangeDetectorRef
//     ) { }

//     ngOnInit(): void {
//         this.route.params.subscribe(params => {
//             this.orderId = params['id'];
//             if (this.orderId) {
//                 this.loadInvoice();
//             }
//         });
//     }

//     loadInvoice(): void {
//         this.loading = true;
//         this.salesService.getSalesOrderById(this.orderId!).subscribe({
//             next: (response) => {
//                 this.order = response.data;
//                 this.loading = false;
//             },
//             error: (error) => {
//                 this.loading = false;
//                 this.toastr.error(error.error?.message || 'Failed to load invoice');
//                 this.router.navigate(['/sales']);
//             }
//         });
//     }

//     printInvoice(): void {
//         window.print();
//     }

//     goBack(): void {
//         this.router.navigate(['/sales']);
//     }
// }





import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SalesService } from '../../../core/services/sales.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-invoice',
    templateUrl: './invoice.html',
    styleUrls: ['./invoice.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class InvoiceComponent implements OnInit, AfterViewInit, OnDestroy {
    order: any = null;
    loading = false;
    orderId: number | null = null;
    error = false;
    isPrintMode = false;
    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private salesService: SalesService,
        private router: Router,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Check if this is a print request
        this.route.queryParams.subscribe(params => {
            this.isPrintMode = params['print'] === 'true';
        });

        this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
            this.orderId = params['id'];
            console.log('Invoice Component - Order ID:', this.orderId);
            if (this.orderId) {
                this.loadInvoice();
            } else {
                this.toastr.error('Invalid order ID');
                this.router.navigate(['/sales']);
            }
        });
    }

    ngAfterViewInit(): void {
        // Auto-print if in print mode
        if (this.isPrintMode && this.order) {
            setTimeout(() => {
                this.printInvoice();
            }, 500);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadInvoice(): void {
        this.loading = true;
        this.error = false;
        this.cdr.markForCheck();

        console.log('Loading invoice for order ID:', this.orderId);

        this.salesService.getSalesOrderById(this.orderId!)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    console.log('Invoice data received:', response);
                    this.order = response.data;
                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading invoice:', error);
                    this.loading = false;
                    this.error = true;
                    this.cdr.markForCheck();
                    this.toastr.error(error.error?.message || 'Failed to load invoice');
                }
            });
    }

    printInvoice(): void {
        // Get the invoice element
        const invoiceElement = document.querySelector('.invoice');
        if (!invoiceElement) return;

        // Get all styles
        const styles = document.querySelectorAll('style, link[rel="stylesheet"]');

        // Create print window
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Write the print content
        printWindow.document.write('<!DOCTYPE html>');
        printWindow.document.write('<html>');
        printWindow.document.write('<head>');
        printWindow.document.write('<title>Invoice #INV-' + this.order.id + '</title>');

        // Copy all styles
        styles.forEach((style: any) => {
            if (style.tagName === 'STYLE') {
                printWindow.document.write('<style>' + style.innerHTML + '</style>');
            } else if (style.tagName === 'LINK') {
                printWindow.document.write('<link href="' + style.href + '" rel="stylesheet">');
            }
        });

        // Add print-specific styles
        printWindow.document.write(`
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Roboto', Arial, sans-serif;
                    background: white;
                    padding: 20px;
                }
                .invoice {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                }
                .invoice-actions {
                    display: none !important;
                }
                .no-print {
                    display: none !important;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    .invoice {
                        box-shadow: none;
                    }
                    .invoice-header {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            </style>
        `);

        printWindow.document.write('</head>');
        printWindow.document.write('<body>');

        // Clone and add invoice content
        const clonedInvoice = invoiceElement.cloneNode(true) as HTMLElement;
        printWindow.document.write(clonedInvoice.outerHTML);

        printWindow.document.write('</body>');
        printWindow.document.write('</html>');
        printWindow.document.close();

        // Trigger print after content loads
        printWindow.onload = () => {
            printWindow.print();
            printWindow.onafterprint = () => {
                printWindow.close();
            };
        };
    }

    goBack(): void {
        this.router.navigate(['/sales']);
    }

    retry(): void {
        if (this.orderId) {
            this.loadInvoice();
        }
    }

    getAmountInWords(amount: number): string {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        const convertToWords = (n: number): string => {
            if (n === 0) return 'Zero';
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
            if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertToWords(n % 100) : '');
            if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convertToWords(n % 1000) : '');
            if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convertToWords(n % 100000) : '');
            return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convertToWords(n % 10000000) : '');
        };

        const rupees = Math.floor(amount);
        const paise = Math.round((amount - rupees) * 100);

        let words = convertToWords(rupees) + ' Rupees';
        if (paise > 0) {
            words += ' and ' + convertToWords(paise) + ' Paise';
        }
        words += ' Only';

        return words;
    }
}
