import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UserService } from '../profile/user.service';

/**
 * Blocks access to admin-only routes (e.g. /users) for anyone who
 * isn't an admin — redirects to home otherwise. Runs alongside
 * authGuard (which already handles "not logged in at all"), so this
 * one only needs to check the IsAdmin flag on the current profile.
 */
export const adminGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.getMe().pipe(
    map((user) => user.isAdmin || router.createUrlTree(['/'])),
    catchError(() => of(router.createUrlTree(['/']))),
  );
};
