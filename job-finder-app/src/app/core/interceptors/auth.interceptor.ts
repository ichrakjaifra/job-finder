import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Ajouter le token d'authentification si l'utilisateur est connecté
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && request.url.includes('localhost:3000')) {
      // Pour JSON Server, on peut ajouter l'ID utilisateur dans les headers
      request = request.clone({
        setHeaders: {
          'X-User-ID': currentUser.id?.toString() || '',
          'Authorization': `Bearer ${currentUser.id}`
        }
      });
    }

    return next.handle(request);
  }
}
