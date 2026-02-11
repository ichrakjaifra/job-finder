import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { JobCardComponent } from '../../../shared/components/job-card/job-card.component';
import { Job, JobFilters } from '../../../core/models/job';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApplicationService } from '../../../core/services/application.service';
import { Favorite } from '../../../core/models/favorite';
import { selectAllFavorites, selectIsJobFavorite } from '../../favorites/store/favorites.selectors';
import { loadFavorites, addFavorite, removeFavorite } from '../../favorites/store/favorites.actions';
import { AppState } from '../../../app.state';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, JobCardComponent],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {
  jobs: Job[] = [];
  loading = false;
  filters: JobFilters = {
    keywords: '',
    location: '',
    type: '',
    experience: '',
    salaryMin: undefined,
    remote: false
  };

  currentPage = 1;
  totalPages = 1;
  totalJobs = 0;

  isAuthenticated = false;
  favorites$: Observable<Favorite[]>;
  searchTerms = new Subject<JobFilters>();

  jobTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];
  experienceLevels = ['Entry', 'Mid', 'Senior', 'Executive'];

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private applicationService: ApplicationService,
    private store: Store<AppState>
  ) {
    this.favorites$ = this.store.select(selectAllFavorites);
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (this.isAuthenticated) {
        this.store.dispatch(loadFavorites());
      }
    });

    this.searchTerms.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) =>
        JSON.stringify(prev) === JSON.stringify(curr)
      ),
      switchMap(filters => this.jobService.searchJobs(filters, this.currentPage))
    ).subscribe({
      next: (response) => {
        this.jobs = response.jobs;
        this.totalJobs = response.total;
        this.totalPages = response.pages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur de recherche:', error);
        this.loading = false;
        this.jobs = [];
        this.totalJobs = 0;
        this.totalPages = 1;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loading = true;
    this.searchTerms.next({ ...this.filters });
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loading = true;
    this.searchTerms.next({ ...this.filters });
  }

  /**
   * Génère les numéros de page pour la pagination
   * Affiche jusqu'à 5 pages autour de la page courante
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      // Si moins de 5 pages, afficher toutes les pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculer la page de départ pour avoir la page courante au milieu
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);

      // Ajuster si on est à la fin
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  onToggleFavorite(job: Job): void {
    if (!this.isAuthenticated) {
      alert('Veuillez vous connecter pour ajouter aux favoris');
      return;
    }

    this.store.select(selectIsJobFavorite(job.id)).pipe(
      take(1)
    ).subscribe(isFavorite => {
      if (isFavorite) {
        this.store.select(selectAllFavorites).pipe(
          take(1)
        ).subscribe(favorites => {
          const favorite = favorites.find(f => f.jobId === job.id);
          if (favorite?.id) {
            this.store.dispatch(removeFavorite({ id: favorite.id }));
          }
        });
      } else {
        const userId = this.authService.getUserId();
        if (!userId) {
          alert('Erreur: Utilisateur non identifié');
          return;
        }

        this.store.dispatch(addFavorite({
          favorite: {
            userId: userId,
            jobId: job.id,
            apiSource: job.apiSource,
            title: job.title,
            company: job.company,
            location: job.location,
            url: job.applyUrl,
            salary: job.salary ? `${job.salary.min}-${job.salary.max} ${job.salary.currency}` : undefined,
            type: job.type
          }
        }));
      }
    });
  }

  onTrackApplication(job: Job): void {
    if (!this.isAuthenticated) {
      alert('Veuillez vous connecter pour suivre cette candidature');
      return;
    }

    this.applicationService.getApplicationByJobId(job.id).pipe(
      take(1)
    ).subscribe({
      next: (applications: any[]) => {
        if (applications.length === 0) {
          this.applicationService.addApplication({
            jobId: job.id,
            apiSource: job.apiSource,
            title: job.title,
            company: job.company,
            location: job.location,
            url: job.applyUrl,
            notes: ''
          }).subscribe({
            next: () => {
              alert('Candidature ajoutée au suivi !');
            },
            error: (error) => {
              console.error('Erreur lors du suivi:', error);
              alert('Erreur lors de l\'ajout de la candidature');
            }
          });
        } else {
          alert('Vous suivez déjà cette candidature');
        }
      },
      error: (error) => {
        console.error('Erreur lors de la vérification:', error);
        alert('Erreur lors de la vérification de la candidature');
      }
    });
  }

  isJobFavorite(jobId: string): Observable<boolean> {
    return this.store.select(selectIsJobFavorite(jobId));
  }

  getAppliedJobIds(): Observable<string[]> {
    if (!this.isAuthenticated) {
      return new Observable<string[]>(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    return this.applicationService.getApplications().pipe(
      take(1),
      map((applications: any[]) => applications.map((app: any) => app.jobId)),
      map(ids => ids || [])
    );
  }

  clearFilters(): void {
    this.filters = {
      keywords: '',
      location: '',
      type: '',
      experience: '',
      salaryMin: undefined,
      remote: false
    };
    this.onSearch();
  }

  /**
   * Vérifie si une offre est déjà suivie
   */
  isJobApplied(jobId: string): Observable<boolean> {
    return this.getAppliedJobIds().pipe(
      map(ids => ids.includes(jobId))
    );
  }

  /**
   * Formatte le nombre d'offres trouvées
   */
  getJobsCountText(): string {
    if (this.totalJobs === 0) return 'Aucune offre trouvée';
    if (this.totalJobs === 1) return '1 offre trouvée';
    return `${this.totalJobs} offres trouvées`;
  }

  /**
   * Réinitialise la recherche avec les filtres par défaut
   */
  resetSearch(): void {
    this.filters = {
      keywords: '',
      location: '',
      type: '',
      experience: '',
      salaryMin: undefined,
      remote: false
    };
    this.currentPage = 1;
    this.onSearch();
  }
}
