import { Component, OnInit, inject, signal } from '@angular/core';
import { DataView, DataViewColumn } from '../../shared/data-view/data-view';
import { User } from '../profile/user.model';
import { UserService } from '../profile/user.service';
import { UserFormModal, UserFormValue } from './user-form-modal/user-form-modal';

@Component({
  selector: 'app-users',
  imports: [DataView, UserFormModal],
  template: `
    <h1>Gebruikersbeheer</h1>

    <app-data-view [items]="users()" [columns]="columns" (add)="isAddModalOpen.set(true)" />

    <app-user-form-modal [(open)]="isAddModalOpen" (submitUser)="onCreate($event)" />
  `,
  styles: `
    :host {
      display: block;
    }

    h1 {
      margin: 0 0 1rem;
      font-size: 1.5rem;
    }
  `,
})
export class Users implements OnInit {
  private readonly userService = inject(UserService);

  protected readonly users = signal<User[]>([]);
  protected readonly isAddModalOpen = signal(false);

  protected readonly columns: DataViewColumn<User>[] = [
    { header: 'Gebruikersnaam', field: 'username' },
    { header: 'Voornaam', field: 'firstName' },
    { header: 'Achternaam', field: 'lastName' },
    { header: 'Admin', field: 'isAdmin' },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  protected onCreate(value: UserFormValue): void {
    this.userService.create(value).subscribe(() => this.loadUsers());
  }

  private loadUsers(): void {
    this.userService.getAll().subscribe((users) => this.users.set(users));
  }
}
