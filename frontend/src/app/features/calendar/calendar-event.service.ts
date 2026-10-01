import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CalendarEvent, CreateCalendarEventRequest } from './calendar-event.model';

const API_URL = `${environment.apiUrl}/calendarEvents`;

/**
 * Talks to the FamilyDashboard.Api backend for calendar events.
 *
 * "from"/"to" is a filter on the collection (which range of dates do
 * you want to see), not a separate endpoint per view — see
 * CalendarEventsController for the reasoning. The caller (Calendar
 * page) decides what range it needs; this service doesn't know
 * anything about "months".
 */
@Injectable({ providedIn: 'root' })
export class CalendarEventService {
  private readonly http = inject(HttpClient);

  getAll(from: Date, to: Date): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(API_URL, {
      params: { from: from.toISOString(), to: to.toISOString() },
    });
  }

  create(request: CreateCalendarEventRequest): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(API_URL, request);
  }
}
