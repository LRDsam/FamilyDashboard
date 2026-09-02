import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextInput } from '../../shared/text-input/text-input';
import { Button } from '../../shared/button/button';
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
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #fff;
    }

    h1 {
      margin: 0 0 1rem;
      font-size: 1.25rem;
    }

    .username {
      margin: 0 0 1rem;
      color: #6b7280;
      font-size: 0.875rem;
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

    .success {
      margin: 0;
      color: #15803d;
      font-size: 0.875rem;
    }
  `,
})
export class Profile implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);

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
}
