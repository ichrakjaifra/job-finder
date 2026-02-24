import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Job } from '../../../core/models/job';
import { JobService } from '../../../core/services/job.service';

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

  constructor(private jobService: JobService) {}

  getJobTitle(): string {
    return this.jobService.getJobTitle(this.job);
  }

  getJobCompany(): string {
    return this.jobService.getJobCompany(this.job);
  }

  getJobLocation(): string {
    return this.jobService.getJobLocation(this.job);
  }

  getJobDescription(): string {
    return this.jobService.getJobShortDescription(this.job, 150);
  }

  getJobType(): string {
    return this.jobService.getJobType(this.job);
  }

  getJobPostedDate(): string {
    return this.jobService.getJobPostedDate(this.job);
  }

  getJobApplyUrl(): string {
    return this.jobService.getJobApplyUrl(this.job);
  }

  getJobApiSource(): string {
    return this.jobService.getJobApiSource();
  }

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
    return 'Non spécifié'; // The Muse API ما كتجيبش salary
  }

  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.job);
  }

  onTrackApplication(): void {
    this.trackApplication.emit(this.job);
  }
}
