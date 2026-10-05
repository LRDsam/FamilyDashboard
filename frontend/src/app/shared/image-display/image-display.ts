import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/**
 * Label + image display field. The image is cropped to fill a
 * fixed-height box (object-fit: cover) so field heights stay
 * predictable regardless of the source image's shape.
 *
 * Usage: <app-image-display label="Photo" src="https://example.com/photo.jpg" />
 */
@Component({
  selector: 'app-image-display',
  imports: [NgOptimizedImage],
  template: `
    <dl>
      <dt>{{ label() }}</dt>
      <dd>
        <img [ngSrc]="src()" [alt]="alt() || label()" fill />
      </dd>
    </dl>
  `,
  styles: `
    :host {
      display: block;
    }

    dl {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      margin: 0;
    }

    dt {
      font-size: 0.875rem;
      color: var(--color-text-subtle);
    }

    dd {
      position: relative;
      height: 200px;
      margin: 0;
      overflow: hidden;
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-md);
      background: var(--color-surface-hover);
    }

    img {
      object-fit: cover;
    }
  `,
})
export class ImageDisplay {
  readonly label = input.required<string>();
  readonly src = input.required<string>();
  readonly alt = input<string>();
}
