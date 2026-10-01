import { Component, effect, inject, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../../../shared/modal/modal';
import { TextInput } from '../../../shared/text-input/text-input';
import { Toggle } from '../../../shared/toggle/toggle';
import { Button } from '../../../shared/button/button';

export interface UserFormValue {
  readonly username: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly isAdmin: boolean;
}

/**
 * Modal with the "new user" form (username, password, name, admin
 * toggle). Same pattern as GroupFormModal/RecipeFormModal.
 *
 * isAdmin is tracked as its own signal rather than a form control,
 * since Toggle isn't a ReactiveForms ControlValueAccessor — it just
 * follows the [checked]/(toggle) input/output pattern used
 * everywhere else in this app (see LightCard).
 *
 * Usage: <app-user-form-modal [(open)]="isAddModalOpen" (submitUser)="onCreate($event)" />
 */
@Component({
  selector: 'app-user-form-modal',
  imports: [Modal, TextInput, Toggle, Button, ReactiveFormsModule],
  template: `
    <app-modal title="Nieuwe gebruiker" [(open)]="open">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <app-text-input label="Gebruikersnaam" [control]="form.controls.username" />
        <app-text-input label="Wachtwoord" type="password" [control]="form.controls.password" />
        <app-text-input label="Voornaam" [control]="form.controls.firstName" />
        <app-text-input label="Achternaam" [control]="form.controls.lastName" />
        <app-toggle label="Admin" [checked]="isAdmin()" (toggle)="isAdmin.set($event)" />

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
export class UserFormModal {
  private readonly formBuilder = inject(FormBuilder);

  /** Two-way bound: `[(open)]="isModalOpen"`. */
  readonly open = model.required<boolean>();
  readonly submitUser = output<UserFormValue>();

  protected readonly isAdmin = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
  });

  constructor() {
    let wasOpen = false;

    effect(() => {
      const isOpen = this.open();
      if (isOpen && !wasOpen) {
        this.form.reset();
        this.isAdmin.set(false);
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

    this.submitUser.emit({ ...this.form.getRawValue(), isAdmin: this.isAdmin() });
    this.open.set(false);
  }
}
