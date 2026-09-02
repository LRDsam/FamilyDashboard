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

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getMe(): Observable<User> {
    return this.http.get<User>(`${API_URL}/me`);
  }

  updateMe(profile: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${API_URL}/me`, profile);
  }
}
