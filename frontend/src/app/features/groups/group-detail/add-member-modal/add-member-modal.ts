import { Component, effect, inject, input, model, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../../../../shared/modal/modal';
import { TextInput } from '../../../../shared/text-input/text-input';
import { Button } from '../../../../shared/button/button';

/**
 * Modal to add a member to a group by username (the backend looks up
 * the matching user itself — see GroupMembersController). Doesn't
 * close itself on submit: the parent decides, so it can keep the
 * modal open and show `errorMessage` when the username doesn't
 * exist or is already a member.
 */
@Component({
  selector: 'app-add-member-modal',
  imports: [Modal, TextInput, Button, ReactiveFormsModule],
  template: `
    <app-modal title="Lid toevoegen" [(open)]="open">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <app-text-input label="Gebruikersnaam" [control]="form.controls.username" />

        @if (errorMessage()) {
          <p class="error" role="alert">{{ errorMessage() }}</p>
        }

        <div class="modal-actions">
          <app-button label="Annuleren" type="button" (buttonClick)="cancel()" />
          <app-button label="Toevoegen" type="submit" variant="success" />
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

    .error {
      margin: 0;
      color: #b91c1c;
      font-size: 0.875rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
  `,
})
export class AddMemberModal {
  private readonly formBuilder = inject(FormBuilder);

  /** Two-way bound: `[(open)]="isModalOpen"`. */
  readonly open = model.required<boolean>();
  /** Shown above the buttons when the add attempt failed. */
  readonly errorMessage = input<string | null>(null);

  readonly submitUsername = output<string>();

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
  });

  constructor() {
    let wasOpen = false;

    effect(() => {
      const isOpen = this.open();
      if (isOpen && !wasOpen) {
        this.form.reset({ username: '' });
      }
      wasOpen = isOpen;
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

    this.submitUsername.emit(this.form.getRawValue().username);
  }
}
