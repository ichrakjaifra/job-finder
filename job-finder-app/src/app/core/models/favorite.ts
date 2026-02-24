export interface Favorite {
  id?: number;
  userId: number;
  jobId: string;
  apiSource: string;
  title: string;
  company: string;
  location: string;
  url: string;
  salary?: string;
  type?: string;
  addedDate: string;
}
