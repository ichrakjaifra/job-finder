import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Application, ApplicationStatus } from '../../../core/models/application';
import { ApplicationService } from '../../../core/services/application.service';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './applications-list.component.html',
  styleUrls: ['./applications-list.component.css']
})
export class ApplicationsListComponent implements OnInit {
  applications: Application[] = [];
  filteredApplications: Application[] = [];
  loading = false;
  error = '';
  selectedFilter: ApplicationStatus | 'all' = 'all';

  // Pour l'édition des notes
  editingNotesId: number | null = null;
  editingNotesText = '';

  // Pour la suppression
  applicationToDelete: Application | null = null;

  constructor(private applicationService: ApplicationService) { }

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.error = '';
    this.applicationService.getApplications().subscribe({
      next: (applications) => {
        this.applications = applications.sort((a, b) =>
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement candidatures:', err);
        this.error = 'Impossible de charger vos candidatures. Vérifiez que le JSON Server est démarré.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.selectedFilter === 'all') {
      this.filteredApplications = [...this.applications];
    } else {
      this.filteredApplications = this.applications.filter(
        app => app.status === this.selectedFilter
      );
    }
  }

  onFilterChange(filter: ApplicationStatus | 'all'): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  updateStatus(application: Application, status: ApplicationStatus): void {
    if (!application.id) return;
    this.applicationService.updateStatus(application.id, status).subscribe({
      next: (updated) => {
        const index = this.applications.findIndex(a => a.id === application.id);
        if (index > -1) {
          this.applications[index] = { ...this.applications[index], ...updated };
          this.applyFilter();
        }
      },
      error: (err) => {
        console.error('Erreur mise à jour statut:', err);
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  // Notes
  startEditingNotes(application: Application): void {
    this.editingNotesId = application.id!;
    this.editingNotesText = application.notes || '';
  }

  cancelEditingNotes(): void {
    this.editingNotesId = null;
    this.editingNotesText = '';
  }

  saveNotes(application: Application): void {
    if (!application.id) return;
    this.applicationService.updateNotes(application.id, this.editingNotesText).subscribe({
      next: (updated) => {
        const index = this.applications.findIndex(a => a.id === application.id);
        if (index > -1) {
          this.applications[index] = { ...this.applications[index], ...updated };
        }
        this.editingNotesId = null;
        this.editingNotesText = '';
      },
      error: (err) => {
        console.error('Erreur sauvegarde notes:', err);
        alert('Erreur lors de la sauvegarde des notes');
      }
    });
  }

  // Suppression
  confirmDelete(application: Application): void {
    this.applicationToDelete = application;
  }

  cancelDelete(): void {
    this.applicationToDelete = null;
  }

  deleteApplication(): void {
    if (!this.applicationToDelete?.id) return;
    const id = this.applicationToDelete.id;
    this.applicationService.deleteApplication(id).subscribe({
      next: () => {
        this.applications = this.applications.filter(a => a.id !== id);
        this.applyFilter();
        this.applicationToDelete = null;
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        alert('Erreur lors de la suppression de la candidature');
        this.applicationToDelete = null;
      }
    });
  }

  // Helpers
  getStatusLabel(status: ApplicationStatus): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Refusée';
      default: return status;
    }
  }

  getStatusBadgeClass(status: ApplicationStatus): string {
    switch (status) {
      case 'pending': return 'bg-warning text-dark';
      case 'accepted': return 'bg-success';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusIcon(status: ApplicationStatus): string {
    switch (status) {
      case 'pending': return 'bi-clock';
      case 'accepted': return 'bi-check-circle';
      case 'rejected': return 'bi-x-circle';
      default: return 'bi-question-circle';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCountByStatus(status: ApplicationStatus): number {
    return this.applications.filter(a => a.status === status).length;
  }
}
