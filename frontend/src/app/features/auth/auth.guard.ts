import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Blocks access to routes nested under it unless the user is logged
 * in — redirects to `/login` otherwise. Applied to the `Shell` route
 * in app.routes.ts, so it covers every page except the login page
 * itself.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn() || router.createUrlTree(['/login']);
};
