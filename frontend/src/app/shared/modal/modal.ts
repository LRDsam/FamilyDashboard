import { Component, ElementRef, effect, input, model, viewChild } from '@angular/core';

/**
 * Generic modal dialog. Controlled via a two-way bound `open` signal,
 * so a trigger button can toggle it with `[(open)]`.
 *
 * Handles the accessibility basics: `role="dialog"` + `aria-modal`,
 * focus moves into the dialog when it opens and returns to whatever
 * triggered it when it closes, and Escape closes it. Clicking the
 * backdrop does *not* close it — only Escape or the close button do.
 *
 * Usage:
 * <app-button label="Bewerken" (buttonClick)="showModal = true" />
 * <app-modal title="Recept bewerken" [(open)]="showModal">
 *   ...form content...
 * </app-modal>
 */
@Component({
  selector: 'app-modal',
  host: {
    '(document:keydown.escape)': 'onEscapeKeydown()',
  },
  template: `
    @if (open()) {
      <div class="backdrop">
        <div
          #dialog
          class="dialog"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          tabindex="-1"
        >
          <div class="dialog-header">
            <h2 [id]="titleId" class="dialog-title">{{ title() }}</h2>
            <button type="button" class="close-button" aria-label="Sluiten" (click)="close()">
              ✕
            </button>
          </div>
          <div class="dialog-body">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgb(0 0 0 / 50%);
      z-index: 1000;
    }

    .dialog {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 32rem;
      max-height: 90vh;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 10px 25px rgb(0 0 0 / 20%);
      outline: none;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .dialog-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    .close-button {
      flex-shrink: 0;
      padding: 0.25rem 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #f9fafb;
      color: #374151;
      font-size: 0.875rem;
      line-height: 1;
      cursor: pointer;
    }

    .close-button:hover {
      background: #f3f4f6;
    }

    .close-button:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
    }

    .dialog-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
      overflow-y: auto;
    }
  `,
})
export class Modal {
  /** Two-way bound: `[(open)]="showModal"`. */
  readonly open = model(false);
  readonly title = input.required<string>();

  private static nextId = 0;

  protected readonly titleId = `modal-title-${++Modal.nextId}`;

  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');
  private lastFocusedElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.lastFocusedElement = document.activeElement as HTMLElement | null;
        this.dialog()?.nativeElement.focus();
      } else {
        this.lastFocusedElement?.focus();
        this.lastFocusedElement = null;
      }
    });
  }

  protected onEscapeKeydown(): void {
    if (this.open()) {
      this.close();
    }
  }

  protected close(): void {
    this.open.set(false);
  }
}
