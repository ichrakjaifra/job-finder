import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Job } from '../../../core/models/job';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.css']
})
export class JobCardComponent {
  @Input() job!: Job;
  @Input() isAuthenticated = false;
  @Input() isFavorite = false;
  @Input() isApplied = false;

  @Output() toggleFavorite = new EventEmitter<Job>();
  @Output() trackApplication = new EventEmitter<Job>();

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;

    return date.toLocaleDateString('fr-FR');
  }

  formatSalary(salary: any): string {
    if (!salary) return 'Non spécifié';
    const min = salary.min?.toLocaleString() || 'N/A';
    const max = salary.max?.toLocaleString() || 'N/A';
    return `${min} - ${max} ${salary.currency}`;
  }

  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.job);
  }

  onTrackApplication(): void {
    this.trackApplication.emit(this.job);
  }
}
