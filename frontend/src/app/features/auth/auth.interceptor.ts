import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Attaches the current auth token (if any) to every outgoing HTTP
 * request as `Authorization: Bearer <token>`, and reacts when the
 * backend rejects it with a 401.
 *
 * A 401 while we're supposedly logged in (isLoggedIn() true) means
 * the token expired or was otherwise invalidated — not a login-form
 * wrong-password response, since that request never carries a token
 * in the first place. In that case we log out and redirect to
 * /login, instead of leaving whatever the user was doing (and every
 * request after it) silently failing.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  const request = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && authService.isLoggedIn()) {
        authService.logout();
        router.navigate(['/login'], { queryParams: { sessionExpired: true } });
      }

      return throwError(() => error);
    }),
  );
};
