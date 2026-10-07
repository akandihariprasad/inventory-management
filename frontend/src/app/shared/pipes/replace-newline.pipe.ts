
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'replaceNewline',
    standalone: false
})
export class ReplaceNewlinePipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return '';
        return value.replace(/\n/g, '<br>');
    }
}
