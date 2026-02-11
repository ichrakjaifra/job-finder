import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterData } from '../../../core/models/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userData: RegisterData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Validation
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.userData).subscribe({
      next: (user) => {
        this.successMessage = 'Compte créé avec succès ! Connexion en cours...';

        // Auto-login après inscription
        setTimeout(() => {
          this.authService.login({
            email: this.userData.email,
            password: this.userData.password
          }).subscribe({
            next: () => {
              this.router.navigate(['/jobs']);
            },
            error: () => {
              this.router.navigate(['/auth/login']);
            }
          });
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de l\'inscription';
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.userData.firstName || !this.userData.lastName ||
      !this.userData.email || !this.userData.password) {
      this.errorMessage = 'Tous les champs sont obligatoires';
      return false;
    }

    if (this.userData.password !== this.userData.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return false;
    }

    if (this.userData.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userData.email)) {
      this.errorMessage = 'Adresse email invalide';
      return false;
    }

    return true;
  }
}
