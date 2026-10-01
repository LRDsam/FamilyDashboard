import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Label + text input field, bound to a Reactive Forms `FormControl`.
 *
 * Usage: <app-text-input label="Naam" [control]="form.controls.name" />
 * Multi-line usage:
 * <app-text-input label="Omschrijving" [control]="form.controls.description" [multiline]="true" />
 * Password usage:
 * <app-text-input label="Wachtwoord" type="password" [control]="form.controls.password" />
 * Date+time usage (native browser picker, value is a string like "2026-06-15T14:30"):
 * <app-text-input label="Datum en tijd" type="datetime-local" [control]="form.controls.startsAt" />
 */
@Component({
  selector: 'app-text-input',
  imports: [ReactiveFormsModule],
  template: `
    <label class="field">
      <span class="field-label">{{ label() }}</span>
      @if (multiline()) {
        <textarea rows="3" [formControl]="control()"></textarea>
      } @else {
        <input [type]="type()" [formControl]="control()" />
      }
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

    input,
    textarea {
      padding: 0.375rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font: inherit;
      color: #1f2937;
    }

    textarea {
      resize: vertical;
    }
  `,
})
export class TextInput {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string>>();
  readonly multiline = input(false);
  readonly type = input<'text' | 'password' | 'datetime-local'>('text');
}
