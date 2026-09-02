import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Recipe } from './recipe.model';

const API_URL = `${environment.apiUrl}/recipes`;

/**
 * Talks to the FamilyDashboard.Api backend for recipe CRUD.
 */
@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(API_URL);
  }

  create(recipe: Omit<Recipe, 'id'>): Observable<Recipe> {
    return this.http.post<Recipe>(API_URL, recipe);
  }

  update(recipe: Recipe): Observable<void> {
    return this.http.put<void>(`${API_URL}/${recipe.id}`, recipe);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
