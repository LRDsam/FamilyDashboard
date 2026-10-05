import { Component, OnInit, inject, signal } from '@angular/core';
import { Grid } from '../../shared/grid/grid';
import { GridSpan } from '../../shared/grid/grid-span';
import { Button } from '../../shared/button/button';
import { SectionHeader } from '../../shared/section-header/section-header';
import { RecipeCard } from './recipe-card/recipe-card';
import { RecipeFormModal, RecipeFormValue } from './recipe-form-modal/recipe-form-modal';
import { Recipe } from './recipe.model';
import { RecipeService } from './recipe.service';

@Component({
  selector: 'app-recipes',
  imports: [SectionHeader, Grid, GridSpan, Button, RecipeCard, RecipeFormModal],
  template: `
    <app-section-header title="Recepten" addButtonLabel="Nieuw recept toevoegen" (add)="isAddModalOpen.set(true)" />

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
