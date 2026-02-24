import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginCredentials, RegisterData } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUserSubject.next(JSON.parse(userData));
    }
  }

  register(userData: RegisterData): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users`, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString()
    });
  }

  login(credentials: LoginCredentials): Observable<User | null> {
    return this.http.get<User[]>(
      `${this.API_URL}/users?email=${credentials.email}&password=${credentials.password}`
    ).pipe(
      map(users => {
        if (users.length > 0) {
          const user = users[0];
          const { password, ...userWithoutPassword } = user;
          this.setCurrentUser(userWithoutPassword);
          return userWithoutPassword;
        }
        return null;
      })
    );
  }

  setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

  updateUser(userId: number, updates: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/users/${userId}`, updates).pipe(
      tap(updatedUser => {
        const { password, ...userWithoutPassword } = updatedUser;
        this.setCurrentUser(userWithoutPassword);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/jobs']);
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}
