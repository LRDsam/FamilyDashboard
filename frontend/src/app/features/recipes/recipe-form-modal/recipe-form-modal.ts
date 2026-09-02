import { Component, computed, effect, inject, input, model, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../../../shared/modal/modal';
import { TextInput } from '../../../shared/text-input/text-input';
import { Button } from '../../../shared/button/button';
import { Recipe } from '../recipe.model';

export type RecipeFormValue = Omit<Recipe, 'id'>;

const EMPTY_VALUE: RecipeFormValue = { name: '', description: '', imageUrl: '', link: '' };

/**
 * Modal with the recipe form (name, description, image URL, link).
 * Shared between adding a new recipe (`Recipes`, no `initialValue`)
 * and editing an existing one (`RecipeCard`, `initialValue` set to
 * the recipe's current values). Emits `submitRecipe` with the raw
 * form values on a valid submit, and closes itself.
 *
 * Usage (add): <app-recipe-form-modal title="Nieuw recept" [(open)]="isAddOpen" (submitRecipe)="onCreate($event)" />
 * Usage (edit): <app-recipe-form-modal title="Recept bewerken" [(open)]="isEditOpen" [initialValue]="current()" (submitRecipe)="onSave($event)" />
 */
@Component({
  selector: 'app-recipe-form-modal',
  imports: [Modal, TextInput, Button, ReactiveFormsModule],
  template: `
    <app-modal [title]="title()" [(open)]="open">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <app-text-input label="Naam" [control]="form.controls.name" />
        <app-text-input
          label="Omschrijving"
          [control]="form.controls.description"
          [multiline]="true"
        />
        <app-text-input label="Afbeelding (URL)" [control]="form.controls.imageUrl" />
        <app-text-input label="Link naar recept" [control]="form.controls.link" />

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
export class RecipeFormModal {
  private readonly formBuilder = inject(FormBuilder);

  /** Two-way bound: `[(open)]="isModalOpen"`. */
  readonly open = model.required<boolean>();
  readonly title = input.required<string>();
  readonly submitLabel = input('Opslaan');
  /** Pre-fill the form with these values. Omit for an empty "add" form. */
  readonly initialValue = input<RecipeFormValue>();

  readonly submitRecipe = output<RecipeFormValue>();

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: ['', Validators.required],
    link: ['', Validators.required],
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

    this.submitRecipe.emit(this.form.getRawValue());
    this.open.set(false);
  }
}
