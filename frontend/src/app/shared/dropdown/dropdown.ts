import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface DropdownOption<T> {
  readonly value: T;
  readonly label: string;
}

/**
 * Label + select field, bound to a Reactive Forms `FormControl` —
 * same pattern as TextInput, but for picking one value out of a
 * fixed list instead of typing free text.
 *
 * Usage:
 * <app-dropdown
 *   label="Groep"
 *   [control]="form.controls.groupId"
 *   [options]="groupOptions()"
 *   placeholder="Geen groep (privé)"
 * />
 *
 * where groupOptions is a DropdownOption<string>[] (e.g. { value:
 * group.id, label: group.description }), and the control is a
 * FormControl<string | null> — selecting the placeholder option sets
 * the control back to null.
 *
 * Omit [placeholder] when every option is a valid, meaningful
 * choice and there's no "nothing selected" state to offer.
 */
@Component({
  selector: 'app-dropdown',
  imports: [ReactiveFormsModule],
  template: `
    <label class="field">
      <span class="field-label">{{ label() }}</span>
      <select [formControl]="control()">
        @if (placeholder()) {
          <option [ngValue]="null">{{ placeholder() }}</option>
        }
        @for (option of options(); track option.value) {
          <option [ngValue]="option.value">{{ option.label }}</option>
        }
      </select>
    </label>
  `,
  styles: `
    :host {
      display: block;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .field-label {
      font-size: 0.875rem;
      color: #374151;
    }

    select {
      padding: 0.375rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #fff;
      font: inherit;
      color: #1f2937;
    }
  `,
})
export class Dropdown<T> {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<T | null>>();
  readonly options = input.required<DropdownOption<T>[]>();
  /** Label for the "nothing selected" option. Omit if every value needs a real selection. */
  readonly placeholder = input<string>();
}
