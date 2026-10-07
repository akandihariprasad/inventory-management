
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: false
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], searchText: string, propertyName: string = 'name'): any[] {
        if (!items) return [];
        if (!searchText) return items;

        searchText = searchText.toLowerCase();

        return items.filter(item => {
            const value = item[propertyName]?.toLowerCase();
            return value && value.includes(searchText);
        });
    }
}