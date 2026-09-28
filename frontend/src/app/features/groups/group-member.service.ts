import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GroupMember } from './group-member.model';

/**
 * Talks to the FamilyDashboard.Api backend for a group's members.
 * Adding/removing a member is admin-only server-side (see
 * GroupMembersController) — this service doesn't enforce that
 * itself, the backend does.
 */
@Injectable({ providedIn: 'root' })
export class GroupMemberService {
  private readonly http = inject(HttpClient);

  private membersUrl(groupId: string): string {
    return `${environment.apiUrl}/groups/${groupId}/members`;
  }

  getAll(groupId: string): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(this.membersUrl(groupId));
  }

  add(groupId: string, username: string): Observable<void> {
    return this.http.post<void>(this.membersUrl(groupId), { username });
  }

  remove(groupId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.membersUrl(groupId)}/${userId}`);
  }
}
