import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TextInput } from '../../shared/text-input/text-input';
import { Button } from '../../shared/button/button';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TextInput, Button],
  template: `
    <div class="login-card">
      <h1>Inloggen</h1>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <app-text-input label="Gebruikersnaam" [control]="loginForm.controls.username" />
        <app-text-input
          label="Wachtwoord"
          type="password"
          [control]="loginForm.controls.password"
        />

        @if (errorMessage()) {
          <p class="error" role="alert">{{ errorMessage() }}</p>
        }

        <app-button label="Inloggen" type="submit" variant="success" [fullWidth]="true" />
      </form>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      padding-block: 3rem;
    }

    .login-card {
      width: 100%;
      max-width: 20rem;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #fff;
    }

    h1 {
      margin: 0 0 1rem;
      font-size: 1.25rem;
    }

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
  `,
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly errorMessage = signal<string | null>(null);

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    const { username, password } = this.loginForm.getRawValue();

    this.authService.login(username, password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => this.errorMessage.set('Ongeldige gebruikersnaam of wachtwoord.'),
    });
  }
}
