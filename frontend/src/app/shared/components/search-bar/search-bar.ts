
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
    templateUrl: './search-bar.html',
    styleUrls: ['./search-bar.css'],
  standalone: false
})
export class SearchBarComponent {
    @Input() placeholder: string = 'Search...';
    @Input() debounceTime: number = 300;
    @Output() search = new EventEmitter<string>();

    searchControl = new FormControl('');

    constructor() {
        this.searchControl.valueChanges
            .pipe(
                debounceTime(this.debounceTime),
                distinctUntilChanged()
            )
            .subscribe(value => {
                this.search.emit(value || '');
            });
    }

    clearSearch(): void {
        this.searchControl.setValue('');
    }
}