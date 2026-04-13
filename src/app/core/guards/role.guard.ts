import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

export const roleGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { redirectTo: state.url }
    });
  }

  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (authService.hasAnyRole(allowedRoles)) {
    return true;
  }

  return router.createUrlTree(['/ranking']);
};