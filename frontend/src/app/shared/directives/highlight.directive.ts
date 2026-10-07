
import { Directive, ElementRef, Input, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: false
})
export class HighlightDirective implements OnInit {
    @Input('appHighlight') color: string = '#ffeb3b';

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    ngOnInit(): void {
        this.renderer.setStyle(this.el.nativeElement, 'background-color', this.color);
        this.renderer.setStyle(this.el.nativeElement, 'transition', 'background-color 0.3s');
    }
}