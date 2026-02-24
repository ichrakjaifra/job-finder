import { createAction, props } from '@ngrx/store';
import { Favorite } from '../../../core/models/favorite';

export const loadFavorites = createAction(
  '[Favorites] Load Favorites'
);

export const loadFavoritesSuccess = createAction(
  '[Favorites] Load Favorites Success',
  props<{ favorites: Favorite[] }>()
);

export const loadFavoritesFailure = createAction(
  '[Favorites] Load Favorites Failure',
  props<{ error: string }>()
);

export const addFavorite = createAction(
  '[Favorites] Add Favorite',
  props<{ favorite: Omit<Favorite, 'id' | 'addedDate'> }>()
);

export const addFavoriteSuccess = createAction(
  '[Favorites] Add Favorite Success',
  props<{ favorite: Favorite }>()
);

export const addFavoriteFailure = createAction(
  '[Favorites] Add Favorite Failure',
  props<{ error: string }>()
);

export const removeFavorite = createAction(
  '[Favorites] Remove Favorite',
  props<{ id: number }>()
);

export const removeFavoriteSuccess = createAction(
  '[Favorites] Remove Favorite Success',
  props<{ id: number }>()
);

export const removeFavoriteFailure = createAction(
  '[Favorites] Remove Favorite Failure',
  props<{ error: string }>()
);
