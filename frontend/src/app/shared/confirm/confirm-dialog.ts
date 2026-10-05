import { Component, effect, inject, signal } from '@angular/core';
import { Modal } from '../modal/modal';
import { Button } from '../button/button';
import { ConfirmService } from './confirm.service';

/**
 * Renders whatever `ConfirmService.ask(...)` is currently waiting on.
 * Mount exactly one of these (in the app shell) and never reference
 * it directly anywhere else — every call site goes through
 * `ConfirmService` instead.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [Modal, Button],
  template: `
    <app-modal [title]="confirmService.request()?.title ?? 'Bevestigen'" [(open)]="isOpen">
      @if (confirmService.request(); as request) {
        <p class="message">{{ request.message }}</p>
        <div class="actions">
          <app-button [label]="request.cancelLabel" type="button" (buttonClick)="cancel()" />
          <app-button
            [label]="request.confirmLabel"
            type="button"
            [variant]="request.danger ? 'danger' : 'success'"
            (buttonClick)="confirm()"
          />
        </div>
      }
    </app-modal>
  `,
  styles: `
    .message {
      margin: 0;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
    }
  `,
})
export class ConfirmDialog {
  protected readonly confirmService = inject(ConfirmService);
  protected readonly isOpen = signal(false);

  constructor() {
    // Open whenever a new request comes in.
    effect(() => {
      if (this.confirmService.request() !== null) {
        this.isOpen.set(true);
      }
    });

    // Resolve as "cancelled" if the modal gets closed any way other
    // than our own confirm()/cancel() below — e.g. Escape or the
    // modal's own close button, which both just flip `open` to false
    // without going through ConfirmService at all.
    effect(() => {
      if (!this.isOpen() && this.confirmService.request() !== null) {
        this.confirmService.respond(false);
      }
    });
  }

  protected confirm(): void {
    this.confirmService.respond(true);
    this.isOpen.set(false);
  }

  protected cancel(): void {
    this.confirmService.respond(false);
    this.isOpen.set(false);
  }
}
