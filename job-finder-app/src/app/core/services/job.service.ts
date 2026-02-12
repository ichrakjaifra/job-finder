import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Job,
  JobFilters,
  JobSearchResponse,
  JobResponse
} from '../models/job';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  // Via Angular proxy => redirigé vers https://www.themuse.com/api/public
  private readonly API_BASE_URL = '/api/muse';

  constructor(private http: HttpClient) {}

  searchJobs(filters: JobFilters, page: number = 1): Observable<JobSearchResponse> {
    // Construire les paramètres pour The Muse API
    // The Muse API utilise page 0-indexed
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('descending', 'true');

    if (filters.keywords) {
      params = params.set('query', filters.keywords);
    }

    if (filters.location) {
      params = params.set('location', filters.location);
    }

    if (filters.experience) {
      params = params.set('level', filters.experience);
    }

    return this.http.get<JobResponse>(`${this.API_BASE_URL}/jobs`, { params }).pipe(
      map((response: JobResponse) => {
        let results = response.results || [];

        // Filtrer par titre contenant les mots-clés (exigence métier)
        if (filters.keywords) {
          const keywordsLower = filters.keywords.toLowerCase();
          results = results.filter(job =>
            job.name.toLowerCase().includes(keywordsLower)
          );
        }

        // Filtrer par localisation
        if (filters.location) {
          const locationLower = filters.location.toLowerCase();
          results = results.filter(job =>
            job.locations?.some(loc =>
              loc.name.toLowerCase().includes(locationLower)
            )
          );
        }

        // Trier par date de publication (du plus récent au plus ancien)
        results.sort((a, b) =>
          new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime()
        );

        return {
          jobs: results,
          total: response.total || results.length,
          page: page,
          pages: response.page_count || Math.ceil((response.total || results.length) / 10)
        };
      })
    );
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.API_BASE_URL}/jobs/${id}`);
  }

  // Utility functions
  getJobTitle(job: Job): string {
    return job.name;
  }

  getJobCompany(job: Job): string {
    return job.company?.name || 'Company not specified';
  }

  getJobLocation(job: Job): string {
    return job.locations?.[0]?.name || 'Location not specified';
  }

  getJobDescription(job: Job): string {
    return job.contents?.replace(/<[^>]*>/g, '') || '';
  }

  getJobShortDescription(job: Job, length: number = 150): string {
    const desc = this.getJobDescription(job);
    return desc.length > length ? desc.substring(0, length) + '...' : desc;
  }

  getJobType(job: Job): string {
    return job.levels?.[0]?.name || 'Full-time';
  }

  getJobExperience(job: Job): string {
    return job.levels?.[0]?.name || 'Not specified';
  }

  getJobPostedDate(job: Job): string {
    return job.publication_date;
  }

  getJobApplyUrl(job: Job): string {
    return job.refs?.landing_page || '#';
  }

  getJobApiSource(): string {
    return 'themuse';
  }
}
