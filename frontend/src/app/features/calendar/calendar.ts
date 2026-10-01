import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Button } from '../../shared/button/button';
import { CalendarEventFormModal } from './calendar-event-form-modal/calendar-event-form-modal';
import { CalendarEvent, CreateCalendarEventRequest } from './calendar-event.model';
import { CalendarEventService } from './calendar-event.service';
import { CalendarDay, MonthGrid } from './month-grid/month-grid';

function firstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function lastOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

// JS Date.getDay() is 0 (Sunday) .. 6 (Saturday). We lay the grid out
// Monday-first (the Dutch convention), so this converts to 1 (Monday)
// .. 7 (Sunday).
function isoWeekday(date: Date): number {
  return ((date.getDay() + 6) % 7) + 1;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Builds the full-weeks grid for the month containing `viewedMonth`:
 * padded at both ends with days from the previous/next month so
 * every row is a complete Monday-to-Sunday week, then slots each
 * event into the day it starts on.
 */
function buildGridDays(viewedMonth: Date, events: CalendarEvent[]): CalendarDay[] {
  const monthStart = firstOfMonth(viewedMonth);
  const monthEnd = lastOfMonth(viewedMonth);

  const gridStart = addDays(monthStart, -(isoWeekday(monthStart) - 1));
  const gridEnd = addDays(monthEnd, 7 - isoWeekday(monthEnd));

  const days: CalendarDay[] = [];
  for (let date = gridStart; date <= gridEnd; date = addDays(date, 1)) {
    days.push({
      date,
      isCurrentMonth: date >= monthStart && date <= monthEnd,
      events: events
        .filter((event) => isSameDay(new Date(event.startsAt), date))
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    });
  }

  return days;
}

@Component({
  selector: 'app-calendar',
  imports: [Button, MonthGrid, CalendarEventFormModal],
  template: `
    <div class="header">
      <h1>Agenda</h1>
      <div class="month-nav">
        <app-button label="‹ Vorige" (buttonClick)="onPreviousMonth()" />
        <span class="month-label">{{ monthLabel() }}</span>
        <app-button label="Volgende ›" (buttonClick)="onNextMonth()" />
      </div>
      <app-button label="+ Nieuw agendapunt" variant="success" (buttonClick)="onAddClick()" />
    </div>

    <app-month-grid [days]="gridDays()" (dayClick)="onDayClick($event)" />

    <app-calendar-event-form-modal
      [(open)]="isAddModalOpen"
      [initialDate]="clickedDate()"
      (submitEvent)="onCreate($event)"
    />
  `,
  styles: `
    :host {
      display: block;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .month-nav {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .month-label {
      min-width: 9rem;
      font-weight: 600;
      text-align: center;
      text-transform: capitalize;
    }
  `,
})
export class Calendar implements OnInit {
  private readonly calendarEventService = inject(CalendarEventService);

  protected readonly viewedMonth = signal(firstOfMonth(new Date()));
  protected readonly events = signal<CalendarEvent[]>([]);
  protected readonly isAddModalOpen = signal(false);
  protected readonly clickedDate = signal<Date | undefined>(undefined);

  protected readonly gridDays = computed(() => buildGridDays(this.viewedMonth(), this.events()));

  protected readonly monthLabel = computed(() =>
    this.viewedMonth().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }),
  );

  ngOnInit(): void {
    this.loadEvents();
  }

  protected onPreviousMonth(): void {
    this.viewedMonth.update((month) => addMonths(month, -1));
    this.loadEvents();
  }

  protected onNextMonth(): void {
    this.viewedMonth.update((month) => addMonths(month, 1));
    this.loadEvents();
  }

  protected onAddClick(): void {
    this.clickedDate.set(undefined);
    this.isAddModalOpen.set(true);
  }

  protected onDayClick(date: Date): void {
    this.clickedDate.set(date);
    this.isAddModalOpen.set(true);
  }

  protected onCreate(request: CreateCalendarEventRequest): void {
    this.calendarEventService.create(request).subscribe(() => this.loadEvents());
  }

  private loadEvents(): void {
    const monthStart = firstOfMonth(this.viewedMonth());
    const monthEnd = lastOfMonth(this.viewedMonth());

    // Load the padding days too, not just the month itself — those
    // days are visible in the grid and could have events on them.
    const from = addDays(monthStart, -(isoWeekday(monthStart) - 1));
    const to = addDays(addDays(monthEnd, 7 - isoWeekday(monthEnd)), 1);

    this.calendarEventService.getAll(from, to).subscribe((events) => this.events.set(events));
  }
}
