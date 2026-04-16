import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.initialized).pipe(
    filter(initialized => initialized),
    take(1),
    map(() => {
      return authService.isLoggedIn()
        ? true
        : router.createUrlTree(['/login']);
    })
  );
};