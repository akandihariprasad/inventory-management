
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
    templateUrl: './loader.html',
    styleUrls: ['./loader.css'],
  standalone: false
})
export class LoaderComponent {
    @Input() loading: boolean = false;
    @Input() message: string = 'Loading...';
    @Input() fullScreen: boolean = false;
}