import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Attaches the bearer token to API requests and transparently refreshes it
 * once when the backend answers 401 (expired access token).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isApi = req.url.startsWith('/api/');
  const isAuthEndpoint = req.url.startsWith('/api/v1/auth/');

  const withToken = (request: HttpRequest<unknown>): HttpRequest<unknown> =>
    auth.token && isApi && !isAuthEndpoint
      ? request.clone({ setHeaders: { Authorization: `Bearer ${auth.token}` } })
      : request;

  return next(withToken(req)).pipe(
    catchError((error: HttpErrorResponse) => {
      const shouldRefresh =
        error.status === 401 && isApi && !isAuthEndpoint && auth.token !== null;
      if (!shouldRefresh) {
        return throwError(() => error);
      }
      return auth.refresh().pipe(
        switchMap(() => next(withToken(req))),
        catchError((refreshError: HttpErrorResponse) => {
          auth.clear();
          router.navigate(['/admin/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
