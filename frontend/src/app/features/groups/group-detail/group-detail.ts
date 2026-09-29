import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { DataView, DataViewColumn } from '../../../shared/data-view/data-view';
import { Group } from '../group.model';
import { GroupService } from '../group.service';
import { GroupMember } from '../group-member.model';
import { GroupMemberService } from '../group-member.service';
import { AddMemberModal } from './add-member-modal/add-member-modal';

@Component({
  selector: 'app-group-detail',
  imports: [DataView, AddMemberModal],
  template: `
    @if (group(); as group) {
      <h1>{{ group.groupCode }}</h1>
      <p class="description">{{ group.description }}</p>
    }

    <h2>Leden</h2>
    <app-data-view
      [items]="members()"
      [columns]="columns"
      [removable]="true"
      idField="id"
      (add)="onOpenAddModal()"
      (remove)="onRemoveMember($event)"
    />

    <app-add-member-modal
      [(open)]="isAddModalOpen"
      [errorMessage]="addErrorMessage()"
      (submitUsername)="onAddMember($event)"
    />
  `,
  styles: `
    :host {
      display: block;
    }

    h1 {
      margin: 0 0 0.25rem;
      font-size: 1.5rem;
    }

    .description {
      margin: 0 0 1.5rem;
      color: #6b7280;
    }

    h2 {
      margin: 0 0 1rem;
      font-size: 1.125rem;
    }
  `,
})
export class GroupDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(GroupService);
  private readonly groupMemberService = inject(GroupMemberService);

  // Read once on init — fine as long as navigation to this page
  // always comes from the groups list (which it does for now). If
  // this page ever needs to handle navigating directly between two
  // group details without a full reload, switch to the reactive
  // route.paramMap instead of a snapshot.
  private readonly groupId = this.route.snapshot.paramMap.get('id')!;

  protected readonly group = signal<Group | null>(null);
  protected readonly members = signal<GroupMember[]>([]);
  protected readonly isAddModalOpen = signal(false);
  protected readonly addErrorMessage = signal<string | null>(null);

  protected readonly columns: DataViewColumn<GroupMember>[] = [
    { header: 'Gebruikersnaam', field: 'username' },
    { header: 'Voornaam', field: 'firstName' },
    { header: 'Achternaam', field: 'lastName' },
  ];

  ngOnInit(): void {
    this.groupService.getById(this.groupId).subscribe((group) => this.group.set(group));
    this.loadMembers();
  }

  protected onOpenAddModal(): void {
    this.addErrorMessage.set(null);
    this.isAddModalOpen.set(true);
  }

  protected onAddMember(username: string): void {
    this.addErrorMessage.set(null);

    this.groupMemberService.add(this.groupId, username).subscribe({
      next: () => {
        this.isAddModalOpen.set(false);
        this.loadMembers();
      },
      error: (error: HttpErrorResponse) => {
        this.addErrorMessage.set(this.errorMessageFor(error, username));
      },
    });
  }

  protected onRemoveMember(userId: string): void {
    this.groupMemberService.remove(this.groupId, userId).subscribe(() => this.loadMembers());
  }

  private errorMessageFor(error: HttpErrorResponse, username: string): string {
    if (error.status === 404) {
      return `Gebruiker '${username}' bestaat niet.`;
    }
    if (error.status === 409) {
      return 'Deze gebruiker is al lid van deze groep.';
    }
    return 'Toevoegen is mislukt.';
  }

  private loadMembers(): void {
    this.groupMemberService
      .getAll(this.groupId)
      .subscribe((members) => this.members.set(members));
  }
}
