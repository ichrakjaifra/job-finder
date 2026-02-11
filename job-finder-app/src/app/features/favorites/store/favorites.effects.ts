import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';

import * as FavoritesActions from './favorites.actions';
import { Favorite } from '../../../core/models/favorite';
import { AuthService } from '../../../core/services/auth.service';
import { AppState } from '../../../app.state';

@Injectable()
export class FavoritesEffects {
  private readonly API_URL = 'http://localhost:3000';

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private authService: AuthService,
    private store: Store<AppState>
  ) {}

  loadFavorites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.loadFavorites),
      withLatestFrom(this.authService.currentUser$),
      mergeMap(([action, user]) => {
        if (!user?.id) {
          return of(FavoritesActions.loadFavoritesFailure({ error: 'User not authenticated' }));
        }

        return this.http.get<Favorite[]>(`${this.API_URL}/favorites?userId=${user.id}`).pipe(
          map(favorites => FavoritesActions.loadFavoritesSuccess({ favorites })),
          catchError(error => of(FavoritesActions.loadFavoritesFailure({ error: error.message })))
        );
      })
    )
  );

  addFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.addFavorite),
      withLatestFrom(this.authService.currentUser$),
      mergeMap(([action, user]) => {
        if (!user?.id) {
          return of(FavoritesActions.addFavoriteFailure({ error: 'User not authenticated' }));
        }

        const favoriteWithDate = {
          ...action.favorite,
          userId: user.id,
          addedDate: new Date().toISOString()
        };

        return this.http.post<Favorite>(`${this.API_URL}/favorites`, favoriteWithDate).pipe(
          map(favorite => FavoritesActions.addFavoriteSuccess({ favorite })),
          catchError(error => of(FavoritesActions.addFavoriteFailure({ error: error.message })))
        );
      })
    )
  );

  removeFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.removeFavorite),
      mergeMap(action =>
        this.http.delete<void>(`${this.API_URL}/favorites/${action.id}`).pipe(
          map(() => FavoritesActions.removeFavoriteSuccess({ id: action.id })),
          catchError(error => of(FavoritesActions.removeFavoriteFailure({ error: error.message })))
        )
      )
    )
  );
}
