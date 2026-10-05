import { Component, OnInit, inject, signal } from '@angular/core';
import { DataView, DataViewColumn } from '../../shared/data-view/data-view';
import { SectionHeader } from '../../shared/section-header/section-header';
import { User } from '../profile/user.model';
import { UserService } from '../profile/user.service';
import { UserFormModal, UserFormValue } from './user-form-modal/user-form-modal';

@Component({
  selector: 'app-users',
  imports: [SectionHeader, DataView, UserFormModal],
  template: `
    <app-section-header
      title="Gebruikersbeheer"
      addButtonLabel="Nieuwe gebruiker toevoegen"
      (add)="isAddModalOpen.set(true)"
    />

    <app-data-view [items]="users()" [columns]="columns" />

    <app-user-form-modal [(open)]="isAddModalOpen" (submitUser)="onCreate($event)" />
  `,
  styles: `
    :host {
      display: block;
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
