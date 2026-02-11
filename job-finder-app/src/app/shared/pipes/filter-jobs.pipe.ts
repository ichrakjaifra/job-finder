import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterJobs',
  standalone: true
})
export class FilterJobsPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
