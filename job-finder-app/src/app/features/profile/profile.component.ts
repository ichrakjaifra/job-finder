import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  editMode = false;

  editForm = {
    firstName: '',
    lastName: '',
    email: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  showPasswordSection = false;
  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.editForm = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        };
      }
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.message = '';
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    this.message = '';
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  updateProfile(): void {
    if (!this.user?.id) return;

    this.loading = true;
    this.message = '';

    this.authService.updateUser(this.user.id, {
      firstName: this.editForm.firstName,
      lastName: this.editForm.lastName,
      email: this.editForm.email
    }).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.editMode = false;
        this.message = 'Profil mis à jour avec succès';
        this.messageType = 'success';
        this.loading = false;

        setTimeout(() => this.message = '', 3000);
      },
      error: (error) => {
        this.message = 'Erreur lors de la mise à jour du profil';
        this.messageType = 'error';
        this.loading = false;
        console.error('Update error:', error);
      }
    });
  }

  updatePassword(): void {
    if (!this.validatePasswordForm()) {
      return;
    }

    this.loading = true;
    this.message = '';

    // Simuler changement de mot de passe
    setTimeout(() => {
      this.message = 'Mot de passe mis à jour avec succès';
      this.messageType = 'success';
      this.loading = false;
      this.showPasswordSection = false;
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };

      setTimeout(() => this.message = '', 3000);
    }, 1000);
  }

  validatePasswordForm(): boolean {
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
      this.message = 'Tous les champs sont obligatoires';
      this.messageType = 'error';
      return false;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.message = 'Le mot de passe doit contenir au moins 6 caractères';
      this.messageType = 'error';
      return false;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.message = 'Les mots de passe ne correspondent pas';
      this.messageType = 'error';
      return false;
    }

    return true;
  }

  deleteAccount(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }

  getInitials(): string {
    if (!this.user) return '';
    return `${this.user.firstName[0]}${this.user.lastName[0]}`.toUpperCase();
  }
}
