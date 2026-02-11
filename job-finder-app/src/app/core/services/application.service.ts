import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application, ApplicationFormData, ApplicationStatus } from '../models/application';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getApplications(): Observable<Application[]> {
    const userId = this.authService.getUserId();
    return this.http.get<Application[]>(`${this.API_URL}/applications?userId=${userId}`);
  }

  addApplication(formData: ApplicationFormData): Observable<Application> {
    const userId = this.authService.getUserId();
    if (!userId) throw new Error('User not authenticated');

    const application: Application = {
      userId,
      jobId: formData.jobId,
      apiSource: formData.apiSource,
      title: formData.title,
      company: formData.company,
      location: formData.location,
      url: formData.url,
      status: 'pending',
      notes: formData.notes || '',
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    return this.http.post<Application>(`${this.API_URL}/applications`, application);
  }

  updateApplication(id: number, updates: Partial<Application>): Observable<Application> {
    const updatedApplication = {
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    return this.http.patch<Application>(`${this.API_URL}/applications/${id}`, updatedApplication);
  }

  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/applications/${id}`);
  }

  updateStatus(id: number, status: ApplicationStatus): Observable<Application> {
    return this.updateApplication(id, { status });
  }

  updateNotes(id: number, notes: string): Observable<Application> {
    return this.updateApplication(id, { notes });
  }

  getApplicationByJobId(jobId: string): Observable<Application[]> {
    const userId = this.authService.getUserId();
    return this.http.get<Application[]>(
      `${this.API_URL}/applications?userId=${userId}&jobId=${jobId}`
    );
  }
}
