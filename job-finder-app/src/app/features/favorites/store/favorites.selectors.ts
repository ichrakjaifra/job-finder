import { createSelector, createFeatureSelector } from '@ngrx/store';
import { FavoritesState } from './favorites.reducer';

export const selectFavoritesState = createFeatureSelector<FavoritesState>('favorites');

export const selectAllFavorites = createSelector(
  selectFavoritesState,
  (state: FavoritesState) => state.favorites
);

export const selectFavoritesLoading = createSelector(
  selectFavoritesState,
  (state: FavoritesState) => state.loading
);

export const selectFavoritesError = createSelector(
  selectFavoritesState,
  (state: FavoritesState) => state.error
);

export const selectFavoriteByJobId = (jobId: string) => createSelector(
  selectAllFavorites,
  (favorites) => favorites.find(fav => fav.jobId === jobId)
);

export const selectIsJobFavorite = (jobId: string) => createSelector(
  selectAllFavorites,
  (favorites) => favorites.some(fav => fav.jobId === jobId)
);
