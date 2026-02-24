import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Favorite } from '../models/favorite';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getFavorites(): Observable<Favorite[]> {
    const userId = this.authService.getUserId();
    return this.http.get<Favorite[]>(`${this.API_URL}/favorites?userId=${userId}`);
  }

  addFavorite(favorite: Omit<Favorite, 'id' | 'addedDate' | 'userId'>): Observable<Favorite> {
    const userId = this.authService.getUserId();
    if (!userId) throw new Error('User not authenticated');

    const favoriteWithUser: Favorite = {
      ...favorite,
      userId,
      addedDate: new Date().toISOString()
    };

    return this.http.post<Favorite>(`${this.API_URL}/favorites`, favoriteWithUser);
  }

  removeFavorite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/favorites/${id}`);
  }

  checkIfFavorite(jobId: string): Observable<Favorite[]> {
    const userId = this.authService.getUserId();
    return this.http.get<Favorite[]>(
      `${this.API_URL}/favorites?userId=${userId}&jobId=${jobId}`
    );
  }
}
