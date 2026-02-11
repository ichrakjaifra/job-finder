import { Directive, Input, ElementRef, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnInit {
  @Input() appHighlight = '';
  @Input() highlightColor = '#fff3cd';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (this.appHighlight) {
      const regex = new RegExp(`(${this.appHighlight})`, 'gi');
      const text = this.el.nativeElement.textContent;
      const highlightedText = text.replace(regex, `<span style="background-color: ${this.highlightColor}; font-weight: bold;">$1</span>`);

      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', highlightedText);
    }
  }
}
