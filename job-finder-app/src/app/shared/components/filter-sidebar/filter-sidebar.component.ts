import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobFilters } from '../../../core/models/job';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.css']
})
export class FilterSidebarComponent {
  @Input() filters: JobFilters = {
    keywords: '',
    location: '',
    type: '',
    experience: '',
    salaryMin: undefined,
    remote: false
  };

  @Output() filterChange = new EventEmitter<JobFilters>();
  @Output() clearFilters = new EventEmitter<void>();

  jobTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];
  experienceLevels = ['Entry', 'Mid', 'Senior', 'Executive'];

  onFilterChange(): void {
    this.filterChange.emit({ ...this.filters });
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }

  clearSalary(): void {
    this.filters.salaryMin = undefined;
    this.onFilterChange();
  }
}
