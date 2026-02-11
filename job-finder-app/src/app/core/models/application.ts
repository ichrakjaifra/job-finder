export interface Application {
  id?: number;
  userId: number;
  jobId: string;
  apiSource: string;
  title: string;
  company: string;
  location: string;
  url: string;
  status: ApplicationStatus;
  notes?: string;
  dateAdded: string;
  lastUpdated?: string;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface ApplicationFormData {
  jobId: string;
  apiSource: string;
  title: string;
  company: string;
  location: string;
  url: string;
  notes?: string;
}
