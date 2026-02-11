import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Favorite } from '../../../core/models/favorite';
import { selectAllFavorites, selectFavoritesLoading } from '../store/favorites.selectors';
import { loadFavorites, removeFavorite } from '../store/favorites.actions';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites-list.component.html',
  styleUrls: ['./favorites-list.component.css']
})
export class FavoritesListComponent implements OnInit {
  favorites$: Observable<Favorite[]>;
  loading$: Observable<boolean>;

  constructor(private store: Store) {
    this.favorites$ = this.store.select(selectAllFavorites);
    this.loading$ = this.store.select(selectFavoritesLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(loadFavorites());
  }

  removeFavorite(id: number): void {
    if (confirm('Voulez-vous vraiment retirer cette offre de vos favoris ?')) {
      this.store.dispatch(removeFavorite({ id }));
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}
