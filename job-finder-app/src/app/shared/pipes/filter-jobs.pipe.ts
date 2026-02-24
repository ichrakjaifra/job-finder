import { Pipe, PipeTransform } from '@angular/core';
import { Job } from '../../core/models/job';

@Pipe({
  name: 'filterJobs',
  standalone: true
})
export class FilterJobsPipe implements PipeTransform {
  transform(jobs: Job[], searchTerm: string): Job[] {
    if (!jobs || !searchTerm) {
      return jobs;
    }

    searchTerm = searchTerm.toLowerCase();

    return jobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm) ||
      job.company.toLowerCase().includes(searchTerm) ||
      job.location.toLowerCase().includes(searchTerm)
    );
  }
}
