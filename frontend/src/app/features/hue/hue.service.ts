import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HueDiscoverResult, HueLight, HuePairResult, HueStatus } from './hue.model';

/**
 * Talks to the FamilyDashboard.Api backend for the Hue setup flow
 * (status/discover/pair) and for reading/controlling the lights
 * themselves. Doesn't talk to the Hue bridge directly — that's
 * HueController/HueClient's job on the backend.
 */
@Injectable({ providedIn: 'root' })
export class HueService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/hue`;

  getStatus(): Observable<HueStatus> {
    return this.http.get<HueStatus>(`${this.baseUrl}/status`);
  }

  discover(): Observable<HueDiscoverResult> {
    // Empty body: the backend action takes no parameters, but an
    // empty object still gets Angular to send a proper
    // Content-Length/Content-Type — some servers (ours included,
    // via nginx/Kestrel) reject a truly bodyless POST outright.
    return this.http.post<HueDiscoverResult>(`${this.baseUrl}/discover`, {});
  }

  pair(): Observable<HuePairResult> {
    return this.http.post<HuePairResult>(`${this.baseUrl}/pair`, {});
  }

  getLights(): Observable<HueLight[]> {
    return this.http.get<HueLight[]>(`${this.baseUrl}/lights`);
  }

  setOn(lightId: string, on: boolean): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/lights/${lightId}/on`, { on });
  }

  setBrightness(lightId: string, brightness: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/lights/${lightId}/brightness`, { brightness });
  }
}
