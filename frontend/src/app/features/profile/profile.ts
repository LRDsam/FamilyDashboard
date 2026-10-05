import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TextInput } from '../../shared/text-input/text-input';
import { Button } from '../../shared/button/button';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, TextInput, Button],
  template: `
    <div class="profile-card">
      <h1>Profiel</h1>

      <p class="username">Gebruikersnaam: {{ username() }}</p>

      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
        <app-text-input label="Voornaam" [control]="profileForm.controls.firstName" />
        <app-text-input label="Achternaam" [control]="profileForm.controls.lastName" />

        @if (errorMessage()) {
          <p class="error" role="alert">{{ errorMessage() }}</p>
        }
        @if (saved()) {
          <p class="success" role="status">Opgeslagen.</p>
        }

        <app-button label="Opslaan" type="submit" variant="success" [fullWidth]="true" />
      </form>

      <div class="logout-section">
        <app-button label="Uitloggen" [fullWidth]="true" (buttonClick)="onLogout()" />
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      padding-block: 3rem;
    }

    .profile-card {
      width: 100%;
      max-width: 20rem;
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
    }

    h1 {
      margin: 0 0 var(--space-4);
      font-size: 1.25rem;
    }

    .username {
      margin: 0 0 var(--space-4);
      color: var(--color-text-muted);
      font-size: 0.875rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .error {
      margin: 0;
      color: var(--color-danger);
      font-size: 0.875rem;
    }

    .success {
      margin: 0;
      color: var(--color-success-hover);
      font-size: 0.875rem;
    }

    .logout-section {
      margin-top: var(--space-5);
      padding-top: var(--space-5);
      border-top: 1px solid var(--color-border);
    }
  `,
})
export class Profile implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly username = signal('');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly saved = signal(false);

  protected readonly profileForm = this.formBuilder.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
  });

  ngOnInit(): void {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.username.set(user.username);
        this.profileForm.setValue({ firstName: user.firstName, lastName: user.lastName });
      },
      error: () => this.errorMessage.set('Profiel kon niet worden geladen.'),
    });
  }

  protected onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.saved.set(false);

    this.userService.updateMe(this.profileForm.getRawValue()).subscribe({
      next: () => this.saved.set(true),
      error: () => this.errorMessage.set('Opslaan is mislukt.'),
    });
  }

  protected onLogout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
