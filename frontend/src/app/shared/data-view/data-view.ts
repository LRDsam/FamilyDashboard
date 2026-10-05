import { Component, inject, input, output } from '@angular/core';
import { ConfirmService } from '../confirm/confirm.service';

/**
 * One column definition for `DataView`: a header label, and the
 * property name on each row object to read the cell value from.
 */
export interface DataViewColumn<T> {
  readonly header: string;
  readonly field: keyof T;
}

/**
 * Generic, read-only table. Columns are defined by property name —
 * no per-cell templates; keep it simple until a real need for more
 * shows up.
 *
 * Doesn't have its own "add" button — that lives in `SectionHeader`,
 * above wherever a `DataView` is used, so every list in the app adds
 * rows the same way instead of each table rolling its own.
 *
 * Usage:
 * <app-data-view [items]="groups()" [columns]="groupColumns" />
 *
 * where (outside the template, e.g. as a class field):
 * protected readonly groupColumns: DataViewColumn<Group>[] = [
 *   { header: 'Code', field: 'groupCode' },
 *   { header: 'Omschrijving', field: 'description' },
 * ];
 *
 * Set [clickableRows]="true" to make each row clickable — e.g. to
 * "zoom in" to that record's detail page: <app-data-view
 * [clickableRows]="true" (rowClick)="onRowClick($event)" ... />
 *
 * Set [removable]="true" to show a trash icon per row. Clicking it
 * asks for confirmation, then emits (remove) with the id read from
 * [idField] (defaults to 'id'):
 * <app-data-view [removable]="true" idField="id" (remove)="onRemove($event)" ... />
 */
@Component({
  selector: 'app-data-view',
  template: `
    <div class="table-scroll">
    <table>
      <thead>
        <tr>
          @for (column of columns(); track column.field) {
            <th>{{ column.header }}</th>
          }
          @if (removable()) {
            <th class="actions-header"></th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of items(); track $index) {
          <tr
            [class.clickable]="clickableRows()"
            [attr.tabindex]="clickableRows() ? 0 : null"
            [attr.role]="clickableRows() ? 'button' : null"
            (click)="onRowClick(row)"
            (keydown.enter)="onRowClick(row)"
          >
            @for (column of columns(); track column.field) {
              <td>{{ getValue(row, column) }}</td>
            }
            @if (removable()) {
              <td class="actions">
                <button
                  type="button"
                  class="remove-button"
                  (click)="onRemoveClick($event, row)"
                  aria-label="Verwijderen"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fill-rule="evenodd"
                      d="M8 2a1 1 0 0 0-1 1v1H4a1 1 0 0 0 0 2h.4l.7 10.1A2 2 0 0 0 7.1 18h5.8a2 2 0 0 0 2-1.9L15.6 6h.4a1 1 0 1 0 0-2h-3V3a1 1 0 0 0-1-1H8Zm1 2h2V4H9v0Zm-1.6 4a1 1 0 0 1 1 .94l.4 7a1 1 0 1 1-2 .12l-.4-7A1 1 0 0 1 7.4 8Zm5.2 0a1 1 0 0 1 .96 1.06l-.4 7a1 1 0 1 1-2-.12l.4-7A1 1 0 0 1 12.6 8Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </td>
            }
          </tr>
        } @empty {
          <tr>
            <td [attr.colspan]="columns().length + (removable() ? 1 : 0)" class="empty">Geen gegevens.</td>
          </tr>
        }
      </tbody>
    </table>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    // A table only ever needs to scroll on its own, never the whole
    // page — this wrapper (not the page's main area, which never
    // scrolls sideways) is what lets a table with more columns than
    // fit on a narrow screen still be reachable, scrolled in place
    // while the rest of the page stays put. min-width: max-content
    // on the table below is what makes that actually kick in instead
    // of just squeezing the columns down to nothing.
    .table-scroll {
      overflow-x: auto;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
    }

    table {
      width: 100%;
      min-width: max-content;
      border-collapse: collapse;
      background: var(--color-surface);
    }

    th,
    td {
      padding: 0.625rem var(--space-4);
      text-align: left;
      font-size: 0.9375rem;
    }

    th {
      background: var(--color-surface-muted);
      color: var(--color-text-subtle);
      font-weight: 600;
      border-bottom: 1px solid var(--color-border);
    }

    td {
      border-bottom: 1px solid var(--color-surface-hover);
      color: var(--color-text);
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr.clickable {
      cursor: pointer;
    }

    tr.clickable:hover {
      background: var(--color-surface-muted);
    }

    tr.clickable:focus-visible {
      outline-offset: -2px;
    }

    .empty {
      text-align: center;
      color: var(--color-text-muted);
    }

    .actions-header {
      width: 2.75rem;
    }

    .actions {
      text-align: right;
    }

    .remove-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      padding: 0;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--color-danger);
      cursor: pointer;
      --color-focus-ring: var(--color-danger);
    }

    .remove-button:hover {
      background: var(--color-danger-bg);
    }

    .remove-button svg {
      width: 1.125rem;
      height: 1.125rem;
    }
  `,
})
export class DataView<T> {
  private readonly confirmService = inject(ConfirmService);

  readonly items = input.required<T[]>();
  readonly columns = input.required<DataViewColumn<T>[]>();
  readonly clickableRows = input(false);
  readonly rowClick = output<T>();

  /** Show a trash icon per row. Requires [idField] to know which property to emit. */
  readonly removable = input(false);
  /** Message shown in the confirmation prompt before (remove) fires. */
  readonly removeConfirmMessage = input('Weet je zeker dat je dit item wilt verwijderen?');
  /** Property on T holding the row's id — read and emitted by (remove) when set. Defaults to 'id'. */
  readonly idField = input<keyof T>('id' as keyof T);
  /** Emits the id (read via [idField]) after the user confirms removal. */
  readonly remove = output<string>();

  protected getValue(row: T, column: DataViewColumn<T>): string {
    return String(row[column.field]);
  }

  protected onRowClick(row: T): void {
    if (this.clickableRows()) {
      this.rowClick.emit(row);
    }
  }

  protected async onRemoveClick(event: Event, row: T): Promise<void> {
    // Stop the row's own click handler (used for clickableRows/rowClick)
    // from also firing when the remove button inside it is clicked.
    event.stopPropagation();

    const confirmed = await this.confirmService.ask({ message: this.removeConfirmMessage() });
    if (!confirmed) {
      return;
    }

    this.remove.emit(String(row[this.idField()]));
  }
}
