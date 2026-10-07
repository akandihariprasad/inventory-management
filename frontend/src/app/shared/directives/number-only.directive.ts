
import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appNumberOnly]',
  standalone: false
})
export class NumberOnlyDirective {
    @Input() allowDecimal: boolean = false;
    @Input() allowNegative: boolean = false;
    @Input() maxValue: number | null = null;
    @Input() minValue: number | null = null;

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const key = event.key;

        // Allow navigation keys
        if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Escape', 'Enter', 'Home', 'End'].includes(key)) {
            return;
        }

        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(key.toLowerCase())) {
            return;
        }

        // Allow decimal point
        if (this.allowDecimal && key === '.') {
            const input = event.target as HTMLInputElement;
            if (input.value.includes('.')) {
                event.preventDefault();
            }
            return;
        }

        // Allow negative sign
        if (this.allowNegative && key === '-') {
            const input = event.target as HTMLInputElement;
            if (input.value.includes('-') || input.selectionStart !== 0) {
                event.preventDefault();
            }
            return;
        }

        // Allow only numbers
        if (!/^\d+$/.test(key)) {
            event.preventDefault();
        }
    }

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        let value = input.value;

        if (this.maxValue !== null && Number(value) > this.maxValue) {
            input.value = this.maxValue.toString();
        }

        if (this.minValue !== null && Number(value) < this.minValue) {
            input.value = this.minValue.toString();
        }
    }
}