import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly danger: boolean;
}

export interface ConfirmOptions {
  readonly message: string;
  readonly title?: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  /**
   * Styles the confirm button as destructive (red) instead of the
   * default success green. Defaults to true, since every current use
   * of this service is a delete confirmation — pass `false` for a
   * non-destructive "are you sure?" prompt.
   */
  readonly danger?: boolean;
}

/**
 * Promise-based confirmation prompt, used instead of the native
 * `confirm()` so every "are you sure?" in the app — deleting a
 * recipe, removing a group member, removing a user, etc. — looks and
 * behaves the same, and matches the rest of the design system
 * instead of looking like a bare browser popup.
 *
 * Requires exactly one `<app-confirm-dialog />` mounted somewhere
 * (currently in the app shell) to actually render the prompt — this
 * service only holds the pending request and resolves it. Call sites
 * never need to know that; they just `await` it:
 *
 *   const confirmed = await this.confirmService.ask({
 *     message: 'Weet je zeker dat je dit recept wilt verwijderen?',
 *   });
 *   if (!confirmed) return;
 *   this.recipeService.delete(id).subscribe(...);
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly _request = signal<ConfirmRequest | null>(null);
  private resolveFn: ((result: boolean) => void) | null = null;

  readonly request = this._request.asReadonly();

  ask(options: ConfirmOptions): Promise<boolean> {
    // Only one confirmation can be open at a time — resolve whatever
    // was pending as cancelled before replacing it, so its promise
    // doesn't hang forever.
    this.respond(false);

    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
      this._request.set({
        title: options.title ?? 'Bevestigen',
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Verwijderen',
        cancelLabel: options.cancelLabel ?? 'Annuleren',
        danger: options.danger ?? true,
      });
    });
  }

  /** Called by ConfirmDialog — not meant to be called from feature code. */
  respond(result: boolean): void {
    this.resolveFn?.(result);
    this.resolveFn = null;
    this._request.set(null);
  }
}
