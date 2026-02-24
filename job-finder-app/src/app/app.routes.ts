import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/jobs',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'jobs',
    loadComponent: () => import('./features/jobs/job-list/job-list.component').then(m => m.JobListComponent)
  },
  /*{
    path: 'jobs/:id',
    loadComponent: () => import('./features/jobs/job-details/job-details.component').then(m => m.JobDetailsComponent)
  },*/
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/favorites-list/favorites-list.component').then(m => m.FavoritesListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'applications',
    loadComponent: () => import('./features/applications/applications-list/applications-list.component').then(m => m.ApplicationsListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/jobs'
  }
];
