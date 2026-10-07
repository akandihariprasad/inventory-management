
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumToArray',
  standalone: false
})
export class EnumToArrayPipe implements PipeTransform {
    transform(enumObj: any): { key: string, value: any }[] {
        return Object.keys(enumObj)
            .filter(key => isNaN(Number(key)))
            .map(key => ({ key, value: enumObj[key] }));
    }
}