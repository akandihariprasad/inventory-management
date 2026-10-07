
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
  standalone: false
})
export class SortPipe implements PipeTransform {
    transform(items: any[], property: string, isAscending: boolean = true): any[] {
        if (!items) return [];
        if (!property) return items;

        return items.sort((a, b) => {
            const valA = a[property];
            const valB = b[property];

            if (typeof valA === 'number' && typeof valB === 'number') {
                return isAscending ? valA - valB : valB - valA;
            }

            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();

            if (isAscending) {
                return strA.localeCompare(strB);
            } else {
                return strB.localeCompare(strA);
            }
        });
    }
}