import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Group } from './group.model';

const API_URL = `${environment.apiUrl}/groups`;

/**
 * Talks to the FamilyDashboard.Api backend for groups. Creating a
 * group is admin-only server-side (see GroupsController) — this
 * service doesn't enforce that itself, the backend does.
 */
@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Group[]> {
    return this.http.get<Group[]>(API_URL);
  }

  // Only the groups the current user is actually a member of — e.g.
  // for the calendar event form's group picker, where picking a
  // group you're not in would just be rejected by the backend anyway.
  getMine(): Observable<Group[]> {
    return this.http.get<Group[]>(`${API_URL}/mine`);
  }

  getById(id: string): Observable<Group> {
    return this.http.get<Group>(`${API_URL}/${id}`);
  }

  create(group: Omit<Group, 'id'>): Observable<Group> {
    return this.http.post<Group>(API_URL, group);
  }
}
