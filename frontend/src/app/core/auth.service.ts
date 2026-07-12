import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, shareReplay, tap } from 'rxjs';
import { AuthResponse } from './models';

const TOKEN_KEY = 'pf-access-token';
const EMAIL_KEY = 'pf-admin-email';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly tokenSignal = signal<string | null>(this.readStorage(TOKEN_KEY));
  readonly email = signal<string | null>(this.readStorage(EMAIL_KEY));
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);

  /** In-flight refresh, shared so parallel 401s trigger only one call. */
  private refreshInFlight: Observable<AuthResponse> | null = null;

  get token(): string | null {
    return this.tokenSignal();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/v1/auth/login', { email, password }, { withCredentials: true })
      .pipe(tap((res) => this.store(res)));
  }

  refresh(): Observable<AuthResponse> {
    this.refreshInFlight ??= this.http
      .post<AuthResponse>('/api/v1/auth/refresh', {}, { withCredentials: true })
      .pipe(
        tap((res) => this.store(res)),
        finalize(() => (this.refreshInFlight = null)),
        shareReplay(1),
      );
    return this.refreshInFlight;
  }

  logout(): void {
    this.http
      .post('/api/v1/auth/logout', {}, { withCredentials: true })
      .subscribe({ complete: () => undefined, error: () => undefined });
    this.clear();
    this.router.navigate(['/admin/login']);
  }

  clear(): void {
    this.tokenSignal.set(null);
    this.email.set(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EMAIL_KEY);
    } catch {
      // ignore
    }
  }

  private store(res: AuthResponse): void {
    this.tokenSignal.set(res.accessToken);
    this.email.set(res.email);
    try {
      localStorage.setItem(TOKEN_KEY, res.accessToken);
      localStorage.setItem(EMAIL_KEY, res.email);
    } catch {
      // ignore
    }
  }

  private readStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
}
