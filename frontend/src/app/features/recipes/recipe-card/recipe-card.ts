import { Component, computed, input, output, signal } from '@angular/core';
import { Card } from '../../../shared/card/card';
import { ImageDisplay } from '../../../shared/image-display/image-display';
import { TextDisplay } from '../../../shared/text-display/text-display';
import { Button } from '../../../shared/button/button';
import { RecipeFormModal, RecipeFormValue } from '../recipe-form-modal/recipe-form-modal';
import { Recipe } from '../recipe.model';

/**
 * Card presenting a single recipe: an image, a name, a short
 * description, and a link to the recipe itself. Built on top of the
 * generic `app-card`, reusing the shared `ImageDisplay`, `TextDisplay`
 * and `Button` fields for a consistent look across the app.
 *
 * When `editable` is true, the header shows edit/delete buttons.
 * Editing opens the shared `RecipeFormModal` (also used by `Recipes`
 * for adding a new recipe), pre-filled with the current values;
 * saving emits the updated recipe via `save`, deleting emits
 * `delete`. The parent (`Recipes`) owns the actual recipe list and
 * applies the change.
 */
@Component({
  selector: 'app-recipe-card',
  imports: [Card, ImageDisplay, TextDisplay, Button, RecipeFormModal],
  template: `
    <app-card [editable]="editable()" (edit)="isEditModalOpen.set(true)" (delete)="delete.emit()">
      <span card-title>{{ name() }}</span>
      <app-image-display label="Foto" [src]="image()" [alt]="name()" />
      <app-text-display label="Omschrijving" [value]="description()" [multiline]="true" />
      <app-button
        label="Link naar recept"
        [link]="link()"
        variant="success"
        [fullWidth]="true"
        [newTab]="true"
      />
    </app-card>

    <app-recipe-form-modal
      title="Recept bewerken"
      [(open)]="isEditModalOpen"
      [initialValue]="formInitialValue()"
      (submitRecipe)="onSubmit($event)"
    />
  `,
})
export class RecipeCard {
  readonly id = input.required<string>();
  readonly image = input.required<string>();
  readonly name = input.required<string>();
  readonly description = input.required<string>();
  readonly link = input.required<string>();

  /** Shows the edit/delete buttons in the card header when true. */
  readonly editable = input(false);
  readonly save = output<Recipe>();
  readonly delete = output<void>();

  protected readonly isEditModalOpen = signal(false);

  protected readonly formInitialValue = computed<RecipeFormValue>(() => ({
    name: this.name(),
    description: this.description(),
    imageUrl: this.image(),
    link: this.link(),
  }));

  protected onSubmit(value: RecipeFormValue): void {
    this.save.emit({ id: this.id(), ...value });
  }
}
