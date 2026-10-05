import { Component, input, output } from '@angular/core';
import { CalendarEvent } from '../calendar-event.model';

export interface CalendarDay {
  readonly date: Date;
  readonly isCurrentMonth: boolean;
  readonly events: CalendarEvent[];
}

const WEEKDAY_LABELS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

/**
 * Dumb month-grid layout: seven columns (days), as many rows as the
 * caller hands it full weeks for. Doesn't know anything about
 * "months" or dates outside what it's given — the Calendar page
 * decides the visible range (including the padding days from the
 * previous/next month needed to fill whole weeks) and loads the
 * events; this component just lays out whatever [days] it receives.
 *
 * Clicking a day (anywhere except an event itself) emits (dayClick)
 * with that day's date — e.g. to open the "new event" form
 * pre-filled with that date. Clicking an event stops that from
 * firing; there's no per-event click behavior yet.
 *
 * Usage: <app-month-grid [days]="gridDays()" (dayClick)="onDayClick($event)" />
 */
@Component({
  selector: 'app-month-grid',
  template: `
    <div class="weekday-header">
      @for (label of weekdayLabels; track label) {
        <div class="weekday">{{ label }}</div>
      }
    </div>
    <div class="grid">
      @for (day of days(); track day.date.getTime()) {
        <div
          class="day"
          [class.outside-month]="!day.isCurrentMonth"
          (click)="dayClick.emit(day.date)"
          (keydown.enter)="dayClick.emit(day.date)"
          tabindex="0"
          role="button"
        >
          <span class="day-number">{{ day.date.getDate() }}</span>
          <ul class="events">
            @for (event of day.events; track event.id) {
              <li class="event" [title]="event.title" (click)="$event.stopPropagation()">
                <span class="event-time">{{ formatTime(event.startsAt) }}</span>
                <span class="event-title">{{ event.title }}</span>
                <span class="event-initials">({{ initials(event) }})</span>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .weekday-header,
    .grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .weekday-header {
      // Same box model as .grid below (border + 1px gap) even though
      // it has neither visually — otherwise its 7 columns compute to
      // a slightly different width than the day columns beneath them
      // (the border + 6 gaps there eat ~8px the header doesn't
      // account for) and the weekday labels drift out of alignment.
      gap: 1px;
      border: 1px solid transparent;
      margin-bottom: var(--space-2);
    }

    .weekday {
      padding: var(--space-1) var(--space-2);
      color: var(--color-text-muted);
      font-size: 0.8125rem;
      font-weight: 600;
      text-align: center;
    }

    .grid {
      gap: 1px;
      background: var(--color-border);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .day {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      min-height: 6rem;
      padding: 0.375rem;
      background: var(--color-surface);
      cursor: pointer;
    }

    .day:hover {
      background: var(--color-surface-muted);
    }

    .day:focus-visible {
      outline: 2px solid var(--color-focus-ring);
      outline-offset: -2px;
    }

    .day.outside-month {
      background: var(--color-surface-muted);
    }

    .day.outside-month .day-number {
      color: var(--color-text-faint);
    }

    .day-number {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .events {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .event {
      display: flex;
      gap: var(--space-1);
      overflow: hidden;
      padding: 0.0625rem var(--space-1);
      border-radius: var(--radius-sm);
      background: var(--color-info-bg);
      color: var(--color-info-text);
      font-size: 0.75rem;
      white-space: nowrap;
    }

    .event-time {
      flex-shrink: 0;
      font-weight: 600;
    }

    .event-title {
      // min-width: 0 so this can actually shrink below its text's
      // natural width — a flex item's automatic minimum is its
      // content size otherwise, which can push .event (and this
      // whole grid) wider than its container for a long title.
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .event-initials {
      flex-shrink: 0;
      color: var(--color-info);
    }
  `,
})
export class MonthGrid {
  readonly days = input.required<CalendarDay[]>();
  readonly dayClick = output<Date>();

  protected readonly weekdayLabels = WEEKDAY_LABELS;

  protected formatTime(startsAt: string): string {
    const date = new Date(startsAt);
    return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  }

  protected initials(event: CalendarEvent): string {
    return `${event.createdByUserFirstName.charAt(0)}${event.createdByUserLastName.charAt(0)}`.toUpperCase();
  }
}
