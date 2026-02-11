import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, take } from 'rxjs';

import { JobCardComponent } from '../../../shared/components/job-card/job-card.component';
import { Job, JobFilters } from '../../../core/models/job';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApplicationService } from '../../../core/services/application.service';
import { Favorite } from '../../../core/models/favorite';
import { selectAllFavorites, selectIsJobFavorite } from '../../favorites/store/favorites.selectors';
import { loadFavorites, addFavorite, removeFavorite } from '../../favorites/store/favorites.actions';

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
    private store: Store
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
      switchMap(filters => this.performSearch(filters))
    ).subscribe();

    this.performSearch(this.filters).subscribe();
  }

  performSearch(filters: JobFilters): Observable<any> {
    this.loading = true;
    return this.jobService.searchJobs(filters, this.currentPage).pipe(
      take(1)
    ).subscribe({
      next: (response) => {
        this.jobs = response.jobs;
        this.totalJobs = response.total;
        this.totalPages = response.pages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.searchTerms.next({ ...this.filters });
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.performSearch(this.filters).subscribe();
  }

  onToggleFavorite(job: Job): void {
    if (!this.isAuthenticated) return;

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
        this.store.dispatch(addFavorite({
          favorite: {
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
    if (!this.isAuthenticated) return;

    this.applicationService.getApplicationByJobId(job.id).pipe(
      take(1)
    ).subscribe(applications => {
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
            console.error('Error tracking application:', error);
          }
        });
      }
    });
  }

  isJobFavorite(jobId: string): Observable<boolean> {
    return this.store.select(selectIsJobFavorite(jobId));
  }

  getAppliedJobIds(): Observable<string[]> {
    return this.applicationService.getApplications().pipe(
      take(1),
      map(applications => applications.map(app => app.jobId))
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
}
