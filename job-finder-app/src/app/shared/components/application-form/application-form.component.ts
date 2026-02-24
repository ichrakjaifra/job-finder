import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationFormData } from '../../../core/models/application';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.css']
})
export class ApplicationFormComponent {
  @Input() jobTitle = '';
  @Input() company = '';
  @Output() save = new EventEmitter<ApplicationFormData>();
  @Output() cancel = new EventEmitter<void>();

  formData: ApplicationFormData = {
    jobId: '',
    apiSource: '',
    title: '',
    company: '',
    location: '',
    url: '',
    notes: ''
  };

  notes = '';

  onSubmit(): void {
    this.save.emit({
      ...this.formData,
      notes: this.notes
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
