import { Component, input, output } from '@angular/core';

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
 * no per-cell templates or row actions (yet); keep it simple until a
 * real need for more shows up.
 *
 * Usage:
 * <app-data-view [items]="groups()" [columns]="groupColumns" (add)="onAdd()" />
 *
 * where (outside the template, e.g. as a class field):
 * protected readonly groupColumns: DataViewColumn<Group>[] = [
 *   { header: 'Code', field: 'groupCode' },
 *   { header: 'Omschrijving', field: 'description' },
 * ];
 *
 * Omit (add) or set [showAddButton]="false" to hide the + button —
 * e.g. for a read-only table, or while the caller doesn't yet know
 * whether the current user is allowed to add a row.
 *
 * Set [clickableRows]="true" to make each row clickable — e.g. to
 * "zoom in" to that record's detail page: <app-data-view
 * [clickableRows]="true" (rowClick)="onRowClick($event)" ... />
 */
@Component({
  selector: 'app-data-view',
  template: `
    @if (showAddButton()) {
      <div class="toolbar">
        <button type="button" class="add-button" (click)="add.emit()" aria-label="Nieuwe toevoegen">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
          </svg>
        </button>
      </div>
    }
    <table>
      <thead>
        <tr>
          @for (column of columns(); track column.field) {
            <th>{{ column.header }}</th>
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
          </tr>
        } @empty {
          <tr>
            <td [attr.colspan]="columns().length" class="empty">Geen gegevens.</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    :host {
      display: block;
    }

    .toolbar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 0.75rem;
    }

    .add-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: #2563eb;
      color: #fff;
      cursor: pointer;
    }

    .add-button:hover {
      background: #1d4ed8;
    }

    .add-button:focus-visible {
      outline: 2px solid #1d4ed8;
      outline-offset: 2px;
    }

    .add-button svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    th,
    td {
      padding: 0.625rem 1rem;
      text-align: left;
      font-size: 0.9375rem;
    }

    th {
      background: #f9fafb;
      color: #374151;
      font-weight: 600;
      border-bottom: 1px solid #e5e7eb;
    }

    td {
      border-bottom: 1px solid #f3f4f6;
      color: #1f2937;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr.clickable {
      cursor: pointer;
    }

    tr.clickable:hover {
      background: #f9fafb;
    }

    tr.clickable:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: -2px;
    }

    .empty {
      text-align: center;
      color: #6b7280;
    }
  `,
})
export class DataView<T> {
  readonly items = input.required<T[]>();
  readonly columns = input.required<DataViewColumn<T>[]>();
  readonly showAddButton = input(true);
  readonly add = output<void>();
  readonly clickableRows = input(false);
  readonly rowClick = output<T>();

  protected getValue(row: T, column: DataViewColumn<T>): string {
    return String(row[column.field]);
  }

  protected onRowClick(row: T): void {
    if (this.clickableRows()) {
      this.rowClick.emit(row);
    }
  }
}
