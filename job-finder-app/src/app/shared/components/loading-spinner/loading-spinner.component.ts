import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center py-5">
      <div class="spinner-border text-primary mb-3"
           [class]="sizeClass"
           role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
      @if (message) {
        <p class="text-muted">{{ message }}</p>
      }
    </div>
  `,
  styles: []
})
export class LoadingSpinnerComponent {
  @Input() message = 'Chargement...';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get sizeClass(): string {
    switch (this.size) {
      case 'sm': return 'spinner-border-sm';
      case 'lg': return 'spinner-border-lg';
      default: return '';
    }
  }
}
