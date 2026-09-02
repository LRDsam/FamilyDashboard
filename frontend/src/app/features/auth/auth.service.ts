import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/auth`;
const TOKEN_STORAGE_KEY = 'familydashboard.auth.token';

interface LoginResponse {
  readonly token: string;
  readonly username: string;
}

/**
 * Handles login against the backend and holds the current auth
 * token. The token is kept in `localStorage` so a page refresh
 * doesn't log the user out.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly token = signal<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));

  readonly isLoggedIn = computed(() => this.token() !== null);

  getToken(): string | null {
    return this.token();
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_URL}/login`, { username, password })
      .pipe(tap((response) => this.setToken(response.token)));
  }

  logout(): void {
    this.setToken(null);
  }

  private setToken(token: string | null): void {
    this.token.set(token);

    if (token === null) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  }
}
