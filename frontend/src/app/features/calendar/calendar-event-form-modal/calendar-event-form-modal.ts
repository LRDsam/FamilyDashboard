import { Component, OnInit, effect, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../../../shared/modal/modal';
import { TextInput } from '../../../shared/text-input/text-input';
import { Dropdown, DropdownOption } from '../../../shared/dropdown/dropdown';
import { Button } from '../../../shared/button/button';
import { GroupService } from '../../groups/group.service';
import { CreateCalendarEventRequest } from '../calendar-event.model';

// datetime-local wants "YYYY-MM-DDTHH:mm" in *local* time (no
// timezone suffix) — toISOString() would convert to UTC first and
// shift the displayed time, so this formats the pieces by hand.
function toDateTimeLocalValue(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Modal with the "new calendar event" form: title, description, a
 * native datetime-local picker, and an optional group (picked from
 * only the groups the current user is a member of — see
 * GroupService.getMine()). Same shape as GroupFormModal/UserFormModal.
 *
 * Usage:
 * <app-calendar-event-form-modal
 *   [(open)]="isAddModalOpen"
 *   [initialDate]="clickedDay()"
 *   (submitEvent)="onCreate($event)"
 * />
 */
@Component({
  selector: 'app-calendar-event-form-modal',
  imports: [Modal, TextInput, Dropdown, Button, ReactiveFormsModule],
  template: `
    <app-modal title="Nieuw agendapunt" [(open)]="open">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <app-text-input label="Titel" [control]="form.controls.title" />
        <app-text-input label="Omschrijving" [control]="form.controls.description" [multiline]="true" />
        <app-text-input label="Datum en tijd" type="datetime-local" [control]="form.controls.startsAt" />
        <app-dropdown
          label="Groep"
          [control]="form.controls.groupId"
          [options]="groupOptions()"
          placeholder="Geen groep (privé)"
        />

        <div class="modal-actions">
          <app-button label="Annuleren" type="button" (buttonClick)="cancel()" />
          <app-button label="Opslaan" type="submit" variant="success" />
        </div>
      </form>
    </app-modal>
  `,
  styles: `
    form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
  `,
})
export class CalendarEventFormModal implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly groupService = inject(GroupService);

  /** Two-way bound: `[(open)]="isModalOpen"`. */
  readonly open = model.required<boolean>();
  /** Pre-fills the date (at 09:00) when the modal opens — e.g. the day clicked in the month grid. Defaults to today. */
  readonly initialDate = input<Date>();

  readonly submitEvent = output<CreateCalendarEventRequest>();

  protected readonly groupOptions = signal<DropdownOption<string>[]>([]);

  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    startsAt: ['', Validators.required],
    groupId: this.formBuilder.control<string | null>(null),
  });

  constructor() {
    let wasOpen = false;

    effect(() => {
      const isOpen = this.open();
      if (isOpen && !wasOpen) {
        // Clone before mutating — initialDate() may be the exact
        // Date instance a MonthGrid day cell holds, and setHours
        // would otherwise corrupt that.
        const date = new Date(this.initialDate() ?? new Date());
        date.setHours(9, 0, 0, 0);

        this.form.reset({
          title: '',
          description: '',
          startsAt: toDateTimeLocalValue(date),
          groupId: null,
        });
      }
      wasOpen = isOpen;
    });
  }

  ngOnInit(): void {
    this.groupService.getMine().subscribe((groups) => {
      this.groupOptions.set(groups.map((group) => ({ value: group.id, label: group.description })));
    });
  }

  protected cancel(): void {
    this.open.set(false);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitEvent.emit({
      title: value.title,
      description: value.description,
      // The datetime-local value is local time with no timezone —
      // `new Date(...)` parses it as such, then toISOString()
      // converts it to the UTC instant the backend stores.
      startsAt: new Date(value.startsAt).toISOString(),
      groupId: value.groupId,
    });
    this.open.set(false);
  }
}
