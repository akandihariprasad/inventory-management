
import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appCurrencyFormat]',
  standalone: false
})
export class CurrencyFormatDirective {
    @Input() currencySymbol: string = '₹';

    @HostListener('blur', ['$event'])
    onBlur(event: Event): void {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/[^0-9.-]/g, '');

        if (value && !isNaN(Number(value))) {
            const num = parseFloat(value);
            input.value = `${this.currencySymbol} ${num.toFixed(2)}`;
        }
    }

    @HostListener('focus', ['$event'])
    onFocus(event: Event): void {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/[^0-9.-]/g, '');
        input.value = value;
    }
}