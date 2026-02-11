import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin } from 'rxjs';
import { Job, JobFilters, JobSearchResponse } from '../models/job';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private readonly API_BASE_URL = 'https://job-finder-api-nine.vercel.app';

  constructor(private http: HttpClient) {}

  searchJobs(filters: JobFilters, page: number = 1): Observable<JobSearchResponse> {
    const params: any = {
      query: filters.keywords,
      location: filters.location,
      page: page.toString()
    };

    if (filters.type) params.type = filters.type;
    if (filters.experience) params.experience = filters.experience;
    if (filters.salaryMin) params.salary_min = filters.salaryMin.toString();
    if (filters.remote) params.remote = 'true';

    // Utiliser plusieurs APIs simultanément
    return forkJoin({
      adzuna: this.searchAdzunaJobs(params),
      reed: this.searchReedJobs(params),
      indeed: this.searchIndeedJobs(params)
    }).pipe(
      map(({ adzuna, reed, indeed }) => {
        const allJobs = [
          ...adzuna.jobs,
          ...reed.jobs,
          ...indeed.jobs
        ];

        // Filtrer par titre contenant les mots-clés
        const filteredJobs = allJobs.filter(job =>
          job.title.toLowerCase().includes(filters.keywords.toLowerCase())
        );

        // Trier par date de publication
        const sortedJobs = filteredJobs.sort((a, b) =>
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );

        // Pagination
        const pageSize = 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedJobs = sortedJobs.slice(startIndex, endIndex);

        return {
          jobs: paginatedJobs,
          total: sortedJobs.length,
          page,
          pages: Math.ceil(sortedJobs.length / pageSize)
        };
      })
    );
  }

  private searchAdzunaJobs(params: any): Observable<{ jobs: Job[] }> {
    return this.http.get<any>(`${this.API_BASE_URL}/adzuna`, { params }).pipe(
      map(response => ({
        jobs: response.results?.map((job: any) => this.mapAdzunaJob(job)) || []
      }))
    );
  }

  private searchReedJobs(params: any): Observable<{ jobs: Job[] }> {
    return this.http.get<any>(`${this.API_BASE_URL}/reed`, { params }).pipe(
      map(response => ({
        jobs: response.results?.map((job: any) => this.mapReedJob(job)) || []
      }))
    );
  }

  private searchIndeedJobs(params: any): Observable<{ jobs: Job[] }> {
    return this.http.get<any>(`${this.API_BASE_URL}/indeed`, { params }).pipe(
      map(response => ({
        jobs: response.results?.map((job: any) => this.mapIndeedJob(job)) || []
      }))
    );
  }

  private mapAdzunaJob(apiJob: any): Job {
    return {
      id: apiJob.id,
      title: apiJob.title,
      company: apiJob.company?.display_name || 'Company not specified',
      location: apiJob.location?.display_name || 'Location not specified',
      description: apiJob.description,
      salary: apiJob.salary_min || apiJob.salary_max ? {
        min: apiJob.salary_min,
        max: apiJob.salary_max,
        currency: apiJob.salary_is_predicted ? 'GBP' : 'USD'
      } : undefined,
      type: apiJob.contract_type || 'Full-time',
      experience: apiJob.category?.label || 'Not specified',
      postedDate: apiJob.created,
      applyUrl: apiJob.redirect_url,
      apiSource: 'adzuna'
    };
  }

  private mapReedJob(apiJob: any): Job {
    return {
      id: apiJob.jobId.toString(),
      title: apiJob.jobTitle,
      company: apiJob.employerName,
      location: apiJob.locationName,
      description: apiJob.jobDescription,
      salary: apiJob.minimumSalary ? {
        min: apiJob.minimumSalary,
        max: apiJob.maximumSalary,
        currency: 'GBP'
      } : undefined,
      type: apiJob.jobType,
      experience: 'Not specified',
      postedDate: apiJob.date,
      applyUrl: apiJob.jobUrl,
      apiSource: 'reed'
    };
  }

  private mapIndeedJob(apiJob: any): Job {
    return {
      id: apiJob.jobkey,
      title: apiJob.jobTitle,
      company: apiJob.company,
      location: apiJob.formattedLocation,
      description: apiJob.snippet,
      salary: apiJob.salary ? {
        min: this.parseSalary(apiJob.salary).min,
        max: this.parseSalary(apiJob.salary).max,
        currency: 'USD'
      } : undefined,
      type: apiJob.jobType,
      experience: 'Not specified',
      postedDate: apiJob.date,
      applyUrl: apiJob.url,
      apiSource: 'indeed'
    };
  }

  private parseSalary(salaryText: string): { min: number, max: number } {
    const matches = salaryText.match(/\$?(\d+(?:,\d+)?)/g);
    if (matches && matches.length >= 2) {
      return {
        min: parseInt(matches[0].replace(/[$,]/g, '')),
        max: parseInt(matches[1].replace(/[$,]/g, ''))
      };
    }
    return { min: 0, max: 0 };
  }

  getJobById(id: string, source: string): Observable<Job> {
    return this.http.get<any>(`${this.API_BASE_URL}/${source}/${id}`).pipe(
      map(response => {
        switch(source) {
          case 'adzuna': return this.mapAdzunaJob(response);
          case 'reed': return this.mapReedJob(response);
          case 'indeed': return this.mapIndeedJob(response);
          default: throw new Error('Unknown API source');
        }
      })
    );
  }
}
