// Job interface for The Muse API
export interface JobCompany {
  id: number;
  short_name: string;
  name: string;
}

export interface JobLocation {
  name: string;
}

export interface JobLevel {
  name: string;
  short_name: string;
}

export interface JobRefs {
  landing_page: string;
}

export interface Job {
  id: number;
  name: string;
  contents: string;
  publication_date: string;
  locations: JobLocation[];
  categories: any[];
  levels: JobLevel[];
  tags: any[];
  refs: JobRefs;
  company: JobCompany;
  model_type: string;
  short_name: string;
  type: string;
}

export interface JobResponse {
  page: number;
  page_count: number;
  items_per_page: number;
  took: number;
  timed_out: boolean;
  total: number;
  results: Job[];
}

// Filters
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
