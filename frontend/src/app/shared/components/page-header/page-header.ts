
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-header',
    templateUrl: './page-header.html',
    styleUrls: ['./page-header.css'],
  standalone: false
})
export class PageHeaderComponent {
    @Input() title: string = '';
    @Input() subtitle: string = '';
    @Input() showBackButton: boolean = false;
    @Input() backButtonText: string = 'Back';
    @Input() showAddButton: boolean = false;
    @Input() addButtonText: string = 'Add';
    @Input() addButtonIcon: string = 'add';
    @Output() backClick = new EventEmitter<void>();
    @Output() addClick = new EventEmitter<void>();

    onBackClick(): void {
        this.backClick.emit();
    }

    onAddClick(): void {
        this.addClick.emit();
    }
}