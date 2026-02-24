import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobFilters } from '../../../core/models/job';

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent {
  @Input() filters: JobFilters = {
    keywords: '',
    location: '',
    type: '',
    experience: '',
    salaryMin: undefined,
    remote: false
  };

  @Input() loading = false;
  @Output() search = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();

  onSearch(): void {
    this.search.emit();
  }

  onClear(): void {
    this.clear.emit();
  }
}
