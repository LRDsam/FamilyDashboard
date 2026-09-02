import { Component, OnInit, inject, signal } from '@angular/core';
import { Grid } from '../../shared/grid/grid';
import { GridSpan } from '../../shared/grid/grid-span';
import { Button } from '../../shared/button/button';
import { RecipeCard } from './recipe-card/recipe-card';
import { RecipeFormModal, RecipeFormValue } from './recipe-form-modal/recipe-form-modal';
import { Recipe } from './recipe.model';
import { RecipeService } from './recipe.service';

@Component({
  selector: 'app-recipes',
  imports: [Grid, GridSpan, Button, RecipeCard, RecipeFormModal],
  template: `
    <div class="page-header">
      <h1>Recepten</h1>
      <app-button label="Nieuw recept" (buttonClick)="isAddModalOpen.set(true)" />
    </div>

    <app-grid>
      @for (recipe of recipes(); track recipe.id) {
        <app-recipe-card
          [appGridSpan]="4"
          [id]="recipe.id"
          [image]="recipe.imageUrl"
          [name]="recipe.name"
          [description]="recipe.description"
          [link]="recipe.link"
          [editable]="true"
          (save)="onSave($event)"
          (delete)="onDelete(recipe.id)"
        />
      }
    </app-grid>

    <app-recipe-form-modal
      title="Nieuw recept toevoegen"
      submitLabel="Toevoegen"
      [(open)]="isAddModalOpen"
      (submitRecipe)="onCreate($event)"
    />
  `,
  styles: `
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }
  `,
})
export class Recipes implements OnInit {
  private readonly recipeService = inject(RecipeService);

  protected readonly recipes = signal<Recipe[]>([]);
  protected readonly isAddModalOpen = signal(false);

  ngOnInit(): void {
    this.loadRecipes();
  }

  protected onCreate(value: RecipeFormValue): void {
    this.recipeService.create(value).subscribe(() => this.loadRecipes());
  }

  protected onSave(updated: Recipe): void {
    this.recipeService.update(updated).subscribe(() => this.loadRecipes());
  }

  protected onDelete(id: string): void {
    this.recipeService.delete(id).subscribe(() => this.loadRecipes());
  }

  private loadRecipes(): void {
    this.recipeService.getAll().subscribe((recipes) => this.recipes.set(recipes));
  }
}
