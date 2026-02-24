import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginCredentials } from '../../../core/models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials: LoginCredentials = {
    email: '',
    password: ''
  };

  loading = false;
  errorMessage = '';
  returnUrl = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/jobs';
    });
  }

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (user) => {
        if (user) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage = 'Email ou mot de passe incorrect';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        this.loading = false;
        console.error('Login error:', error);
      }
    });
  }
}
