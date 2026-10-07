
import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appPhoneMask]',
  standalone: false
})
export class PhoneMaskDirective {
    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/\D/g, '');

        if (value.length > 10) {
            value = value.slice(0, 10);
        }

        if (value.length >= 6) {
            input.value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
        } else if (value.length >= 3) {
            input.value = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else {
            input.value = value;
        }
    }
}