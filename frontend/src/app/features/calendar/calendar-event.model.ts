export interface CalendarEvent {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly startsAt: string;
  readonly createdByUserId: string;
  readonly createdByUserFirstName: string;
  readonly createdByUserLastName: string;
  readonly groupId: string | null;
}

export interface CreateCalendarEventRequest {
  readonly title: string;
  readonly description: string;
  readonly startsAt: string;
  readonly groupId: string | null;
}
