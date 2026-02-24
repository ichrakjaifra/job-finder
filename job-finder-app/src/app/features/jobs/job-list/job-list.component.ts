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

    // Load initial jobs
    this.onSearch();
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

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  }

  onToggleFavorite(job: Job): void {
    if (!this.isAuthenticated) {
      alert('Veuillez vous connecter pour ajouter aux favoris');
      return;
    }

    const jobId = job.id.toString(); // Convertir number → string

    this.store.select(selectIsJobFavorite(jobId)).pipe(
      take(1)
    ).subscribe(isFavorite => {
      if (isFavorite) {
        this.store.select(selectAllFavorites).pipe(
          take(1)
        ).subscribe(favorites => {
          const favorite = favorites.find(f => f.jobId === jobId);
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
            jobId: jobId, // string
            apiSource: 'themuse',
            title: this.jobService.getJobTitle(job),
            company: this.jobService.getJobCompany(job),
            location: this.jobService.getJobLocation(job),
            url: this.jobService.getJobApplyUrl(job),
            salary: undefined,
            type: this.jobService.getJobType(job)
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

    const jobId = job.id.toString();

    this.applicationService.getApplicationByJobId(jobId).pipe(
      take(1)
    ).subscribe({
      next: (applications: any[]) => {
        if (applications.length === 0) {
          this.applicationService.addApplication({
            jobId: jobId,
            apiSource: 'themuse',
            title: this.jobService.getJobTitle(job),
            company: this.jobService.getJobCompany(job),
            location: this.jobService.getJobLocation(job),
            url: this.jobService.getJobApplyUrl(job),
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

  isJobFavorite(jobId: number): Observable<boolean> {
    return this.store.select(selectIsJobFavorite(jobId.toString()));
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

  resetSearch(): void {
    this.clearFilters();
  }
}
