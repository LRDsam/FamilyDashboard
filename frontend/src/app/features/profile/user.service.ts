import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from './user.model';

const API_URL = `${environment.apiUrl}/users`;

export interface UpdateProfileRequest {
  readonly firstName: string;
  readonly lastName: string;
}

export interface CreateUserRequest {
  readonly username: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly isAdmin: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getMe(): Observable<User> {
    return this.http.get<User>(`${API_URL}/me`);
  }

  updateMe(profile: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${API_URL}/me`, profile);
  }

  // Admin-only server-side (see UsersController) — this service
  // doesn't enforce that itself, the backend does.
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(API_URL);
  }

  create(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(API_URL, user);
  }
}
