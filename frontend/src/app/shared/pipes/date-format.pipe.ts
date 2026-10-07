import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateFormat',
  standalone: false
})
export class DateFormatPipe implements PipeTransform {
    private datePipe = inject(DatePipe);

    transform(value: Date | string, format: string = 'dd/MM/yyyy HH:mm'): string {
        if (!value) return '';

        const date = typeof value === 'string' ? new Date(value) : value;

        if (isNaN(date.getTime())) return '';

        return this.datePipe.transform(date, format) || '';
    }
}