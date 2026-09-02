import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../features/profile/user.model';
import { UserService } from '../../features/profile/user.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `
    <h1>Family Dashboard</h1>

    <a class="avatar" routerLink="/profile" [attr.aria-label]="'Profiel van ' + fullName()">
      {{ initials() }}
    </a>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      padding-inline: 1.5rem;
      background: #1f2937;
      color: #fff;
    }

    h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #4b5563;
      color: #fff;
      font-size: 0.8125rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }

    .avatar:hover {
      background: #6b7280;
    }

    .avatar:focus-visible {
      outline: 2px solid #93c5fd;
      outline-offset: 2px;
    }
  `,
})
export class Header implements OnInit {
  private readonly userService = inject(UserService);
  private readonly user = signal<User | null>(null);

  protected readonly fullName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  protected readonly initials = computed(() => {
    const user = this.user();
    if (!user) {
      return '';
    }
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  });

  ngOnInit(): void {
    this.userService.getMe().subscribe((user) => this.user.set(user));
  }
}
