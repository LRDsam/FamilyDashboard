import { Component, computed, effect, inject, input, model, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../../../shared/modal/modal';
import { TextInput } from '../../../shared/text-input/text-input';
import { Button } from '../../../shared/button/button';
import { Group } from '../group.model';

export type GroupFormValue = Omit<Group, 'id'>;

const EMPTY_VALUE: GroupFormValue = { groupCode: '', description: '' };

/**
 * Modal with the group form (code, description). Same pattern as
 * RecipeFormModal — shared between adding a new group (no
 * `initialValue`) and, later, editing an existing one.
 *
 * Usage (add): <app-group-form-modal title="Nieuwe groep" [(open)]="isAddOpen" (submitGroup)="onCreate($event)" />
 */
@Component({
  selector: 'app-group-form-modal',
  imports: [Modal, TextInput, Button, ReactiveFormsModule],
  template: `
    <app-modal [title]="title()" [(open)]="open">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <app-text-input label="Code" [control]="form.controls.groupCode" />
        <app-text-input label="Omschrijving" [control]="form.controls.description" />

        <div class="modal-actions">
          <app-button label="Annuleren" type="button" (buttonClick)="cancel()" />
          <app-button [label]="submitLabel()" type="submit" variant="success" />
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
export class GroupFormModal {
  private readonly formBuilder = inject(FormBuilder);

  /** Two-way bound: `[(open)]="isModalOpen"`. */
  readonly open = model.required<boolean>();
  readonly title = input.required<string>();
  readonly submitLabel = input('Opslaan');
  /** Pre-fill the form with these values. Omit for an empty "add" form. */
  readonly initialValue = input<GroupFormValue>();

  readonly submitGroup = output<GroupFormValue>();

  protected readonly form = this.formBuilder.nonNullable.group({
    groupCode: ['', Validators.required],
    description: ['', Validators.required],
  });

  private readonly formValueOnOpen = computed(() => this.initialValue() ?? EMPTY_VALUE);

  constructor() {
    let wasOpen = false;

    effect(() => {
      const isOpen = this.open();
      if (isOpen && !wasOpen) {
        this.form.reset(this.formValueOnOpen());
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

    this.submitGroup.emit(this.form.getRawValue());
    this.open.set(false);
  }
}
