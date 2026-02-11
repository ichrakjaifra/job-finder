import { createReducer, on } from '@ngrx/store';
import { Favorite } from '../../../core/models/favorite';
import * as FavoritesActions from './favorites.actions';

export interface FavoritesState {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
}

export const initialState: FavoritesState = {
  favorites: [],
  loading: false,
  error: null
};

export const favoritesReducer = createReducer(
  initialState,

  // Load Favorites
  on(FavoritesActions.loadFavorites, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(FavoritesActions.loadFavoritesSuccess, (state, { favorites }) => ({
    ...state,
    favorites,
    loading: false
  })),
  on(FavoritesActions.loadFavoritesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Add Favorite
  on(FavoritesActions.addFavorite, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(FavoritesActions.addFavoriteSuccess, (state, { favorite }) => ({
    ...state,
    favorites: [...state.favorites, favorite],
    loading: false
  })),
  on(FavoritesActions.addFavoriteFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Remove Favorite
  on(FavoritesActions.removeFavorite, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(FavoritesActions.removeFavoriteSuccess, (state, { id }) => ({
    ...state,
    favorites: state.favorites.filter(fav => fav.id !== id),
    loading: false
  })),
  on(FavoritesActions.removeFavoriteFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);
