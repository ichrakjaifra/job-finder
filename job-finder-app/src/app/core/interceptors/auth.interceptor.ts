import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const currentUser = authService.getCurrentUser();

  if (currentUser && req.url.includes('localhost:3000')) {
    const clonedReq = req.clone({
      setHeaders: {
        'X-User-ID': currentUser.id?.toString() || '',
        'Authorization': `Bearer ${currentUser.id}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
