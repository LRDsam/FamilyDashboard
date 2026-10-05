You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices
- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements
- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components
- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management
- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates
- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services
- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Design System (styling/overhaul branch)

The whole app went through a styling pass to formalize a design system that
was previously just hand-copied hex colors repeated across every component.
Follow these conventions for any new UI — don't reintroduce hardcoded colors,
spacing, or ad-hoc patterns these replaced.

### Tokens (`src/styles.scss`)

Everything lives in `:root` as CSS custom properties, in three layers:

- **Primitives**: `--gray-50`..`--gray-900`, `--blue-*`, `--green-*`, `--red-*`
  — these match Tailwind's default palette (that's what was already in use
  by hand). Components should almost never reference these directly.
- **Semantic tokens**: `--color-primary`, `--color-success*`, `--color-danger*`,
  `--color-info*`, `--color-text*`, `--color-border*`, `--color-surface*`,
  `--color-focus-ring*`. These are what components actually use — "what
  color is danger text" is answered in one place.
- **Chrome/nav tokens**: `--color-nav-bg`, `--color-nav-bg-hover`,
  `--color-nav-bg-active`, `--color-nav-text`, `--color-chrome-muted`. Added
  because the header/sidenav dip into the gray scale for things that aren't
  body text or a page surface (a nav background, nav link text) — use these
  instead of reaching for `--color-text-*` or `--gray-*` directly for that.
- Also: `--space-1`..`--space-6` (spacing scale), `--radius-sm/md/lg`,
  `--font-sans`. A value that doesn't land on the spacing scale (e.g. a
  deliberately tight `0.375rem` padding) is left as a raw rem value rather
  than forced onto the nearest token — only values that already matched the
  scale were formalized.

A global `:focus-visible` rule in `styles.scss` handles focus rings
everywhere. A component on a dark background overrides
`--color-focus-ring: var(--color-focus-ring-on-dark)` on its own `:host`
instead of writing its own `:focus-visible` rule.

### Shared components (`src/app/shared/`)

- **`SectionHeader`**: the title + add-button row for any list-like page
  (Groups, Users, GroupDetail's member list, Recipes, Calendar). Always the
  same square "+" icon button — don't build a page-specific header/button
  again. Supports `level="2"` for a page that already has its own `<h1>`,
  and content projection for extra controls (e.g. Calendar's month
  prev/next nav) between the title and the button. `DataView` deliberately
  has no add button of its own anymore — the `SectionHeader` above it owns
  that.
- **`ConfirmService` / `ConfirmDialog`**: every delete action must go
  through `await this.confirmService.ask({ message })` — never the native
  `confirm()`. Exactly one `<app-confirm-dialog />` is mounted, in
  `layout/shell/shell.html`; nothing else should render one. `Button` has a
  `danger` variant (red) specifically for this dialog's confirm button.
- **`DataView`**: generic read-only table, no add button (see
  `SectionHeader` above). Deleting a row asks for confirmation via
  `ConfirmService` (customize wording with `[removeConfirmMessage]`). Its
  `<table>` has `min-width: max-content` inside a `.table-scroll` wrapper
  with `overflow-x: auto`, so a table with more columns than fit on a
  narrow screen scrolls itself in place — the page around it never does
  (see below).
- **`Card`**: its delete icon button also confirms first, via
  `[deleteConfirmMessage]` (defaults to a generic message).
- **`Modal`**: generic dialog, used directly by feature "form modals" and
  by `ConfirmDialog`. Closes on Escape; doesn't trap Tab inside it yet
  (known gap, not fixed).

### Layout shell (`src/app/layout/`)

- The sidenav is collapsible: `SidenavStateService` (signal + localStorage,
  key `sidenav-collapsed`) holds the state. `Shell` sets a `--sidenav-width`
  CSS var (`220px`/`0px`) that drives the grid column; the toggle button
  lives in `shell.html` (not inside `Sidenav`) so it stays anchored to the
  sidenav/main boundary — vertically centered on that row, horizontally
  tracking `--sidenav-width` — even once the sidenav's own width (and thus
  its content, hidden via `visibility: hidden` when collapsed) is 0.
- `main`'s `overflow-x` is `hidden` (only `overflow-y` is `auto`) —
  deliberately, so the page itself can never scroll sideways from a stray
  1px rounding error somewhere inside a page. If something genuinely needs
  horizontal scroll (like a wide table), give *that element* its own
  `overflow-x: auto` wrapper (see `DataView` above) rather than relying on
  the page scrolling.
- Header is `56px`, footer padding is `var(--space-2) var(--space-5)` —
  both were intentionally trimmed down slightly; don't bump them back up to
  round numbers without checking why.
