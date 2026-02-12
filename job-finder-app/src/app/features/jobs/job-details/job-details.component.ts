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
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = parseInt(idParam, 10);

      this.job$ = this.jobService.getJobById(id).pipe(
        switchMap(job => {
          this.loading = false;
          this.isFavorite$ = this.store.select(selectIsJobFavorite(job.id.toString()));

          if (this.isAuthenticated) {
            this.applicationService.getApplicationByJobId(job.id.toString()).subscribe({
              next: (apps) => this.isApplied = apps.length > 0,
              error: () => this.isApplied = false
            });
          }

          return of(job);
        })
      );
    }
  }

  // Formatage pour l'affichage
  getJobTitle(job: Job): string {
    return this.jobService.getJobTitle(job);
  }

  getJobCompany(job: Job): string {
    return this.jobService.getJobCompany(job);
  }

  getJobLocation(job: Job): string {
    return this.jobService.getJobLocation(job);
  }

  getJobDescription(job: Job): string {
    return this.jobService.getJobDescription(job);
  }

  getJobType(job: Job): string {
    return this.jobService.getJobType(job);
  }

  getJobExperience(job: Job): string {
    return this.jobService.getJobExperience(job);
  }

  getJobPostedDate(job: Job): string {
    return this.jobService.getJobPostedDate(job);
  }

  getJobApplyUrl(job: Job): string {
    return this.jobService.getJobApplyUrl(job);
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

  onToggleFavorite(job: Job): void {
    if (!this.isAuthenticated) return;

    const jobId = job.id.toString();

    this.store.select(selectIsJobFavorite(jobId)).subscribe(isFavorite => {
      if (isFavorite) {
        this.store.select(state => state.favorites.favorites).subscribe((favorites: any) => {
          const favorite = favorites.find((f: any) => f.jobId === jobId);
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
              jobId: jobId,
              apiSource: 'themuse',
              title: this.getJobTitle(job),
              company: this.getJobCompany(job),
              location: this.getJobLocation(job),
              url: this.getJobApplyUrl(job),
              salary: undefined,
              type: this.getJobType(job)
            }
          }));
        }
      }
    });
  }

  onTrackApplication(job: Job): void {
    if (!this.isAuthenticated || this.isApplied) return;

    this.applicationService.addApplication({
      jobId: job.id.toString(),
      apiSource: 'themuse',
      title: this.getJobTitle(job),
      company: this.getJobCompany(job),
      location: this.getJobLocation(job),
      url: this.getJobApplyUrl(job),
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
