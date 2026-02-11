import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, switchMap } from 'rxjs';
import { Job } from '../../../core/models/job';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApplicationService } from '../../../core/services/application.service';
import { selectIsJobFavorite } from '../../favorites/store/favorites.selectors';
import { addFavorite, removeFavorite } from '../../favorites/store/favorites.actions';
import { AppState } from '../../../app.state';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit {
  job$: Observable<Job | null> = of(null);
  isAuthenticated = false;
  isFavorite$: Observable<boolean> = of(false);
  isApplied = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private authService: AuthService,
    private applicationService: ApplicationService,
    private store: Store<AppState>
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const source = this.route.snapshot.queryParamMap.get('source') || 'adzuna';

    if (id) {
      this.job$ = this.jobService.getJobById(id, source).pipe(
        switchMap(job => {
          this.loading = false;
          this.isFavorite$ = this.store.select(selectIsJobFavorite(job.id));

          if (this.isAuthenticated) {
            this.applicationService.getApplicationByJobId(job.id).subscribe({
              next: (apps) => this.isApplied = apps.length > 0,
              error: () => this.isApplied = false
            });
          }

          return of(job);
        })
      );
    }
  }

  formatSalary(salary: any): string {
    if (!salary) return 'Non spécifié';
    const min = salary.min?.toLocaleString() || 'N/A';
    const max = salary.max?.toLocaleString() || 'N/A';
    return `${min} - ${max} ${salary.currency}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  onToggleFavorite(job: Job): void {
    if (!this.isAuthenticated) return;

    this.store.select(selectIsJobFavorite(job.id)).subscribe(isFavorite => {
      if (isFavorite) {
        this.store.select(state => state.favorites.favorites).subscribe((favorites: any) => {
          const favorite = favorites.find((f: any) => f.jobId === job.id);
          if (favorite?.id) {
            this.store.dispatch(removeFavorite({ id: favorite.id }));
          }
        });
      } else {
        const userId = this.authService.getUserId();
        if (userId) {
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
      }
    });
  }

  onTrackApplication(job: Job): void {
    if (!this.isAuthenticated || this.isApplied) return;

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
        this.isApplied = true;
        alert('Candidature ajoutée au suivi !');
      },
      error: (error) => {
        console.error('Error tracking application:', error);
        alert('Erreur lors de l\'ajout de la candidature');
      }
    });
  }
}
