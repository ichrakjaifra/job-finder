// src/app/app.state.ts
import { FavoritesState } from './features/favorites/store/favorites.reducer';

export interface AppState {
  favorites: FavoritesState;
}
