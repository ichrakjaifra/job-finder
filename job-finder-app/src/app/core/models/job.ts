export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  type: string;
  experience: string;
  postedDate: string;
  applyUrl: string;
  apiSource: string;
  isFavorite?: boolean;
  isApplied?: boolean;
}

export interface JobFilters {
  keywords: string;
  location: string;
  type?: string;
  experience?: string;
  salaryMin?: number;
  remote?: boolean;
}

export interface JobSearchResponse {
  jobs: Job[];
  total: number;
  page: number;
  pages: number;
}
