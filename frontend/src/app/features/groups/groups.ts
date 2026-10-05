import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataView, DataViewColumn } from '../../shared/data-view/data-view';
import { SectionHeader } from '../../shared/section-header/section-header';
import { Group } from './group.model';
import { GroupService } from './group.service';
import { GroupFormModal, GroupFormValue } from './group-form-modal/group-form-modal';

@Component({
  selector: 'app-groups',
  imports: [SectionHeader, DataView, GroupFormModal],
  template: `
    <app-section-header
      title="Groepen"
      addButtonLabel="Nieuwe groep toevoegen"
      (add)="isAddModalOpen.set(true)"
    />

    <app-data-view [items]="groups()" [columns]="columns" [clickableRows]="true" (rowClick)="onRowClick($event)" />

    <app-group-form-modal
      title="Nieuwe groep"
      [(open)]="isAddModalOpen"
      (submitGroup)="onCreate($event)"
    />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class Groups implements OnInit {
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);

  protected readonly groups = signal<Group[]>([]);
  protected readonly isAddModalOpen = signal(false);

  protected readonly columns: DataViewColumn<Group>[] = [
    { header: 'Code', field: 'groupCode' },
    { header: 'Omschrijving', field: 'description' },
  ];

  ngOnInit(): void {
    this.loadGroups();
  }

  protected onRowClick(group: Group): void {
    this.router.navigate(['/groups', group.id]);
  }

  protected onCreate(value: GroupFormValue): void {
    this.groupService.create(value).subscribe(() => this.loadGroups());
  }

  private loadGroups(): void {
    this.groupService.getAll().subscribe((groups) => this.groups.set(groups));
  }
}
