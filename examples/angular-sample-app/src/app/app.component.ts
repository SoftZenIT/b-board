import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Language {
  id: string;
  label: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div [class]="'app ' + theme">
      <header>
        <h1>BBoard + Angular</h1>

        <div class="controls">
          <label>
            Language:
            <select id="language-select" data-testid="language-select" [(ngModel)]="language">
              @for (l of languages; track l.id) {
                <option [value]="l.id">{{ l.label }}</option>
              }
            </select>
          </label>

          <label>
            Theme:
            <select data-testid="theme-select" [(ngModel)]="theme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </label>

          <label>
            Layout:
            <select data-testid="layout-select" [(ngModel)]="layoutVariant">
              <option value="desktop-azerty">Desktop AZERTY</option>
              <option value="mobile-default">Mobile</option>
            </select>
          </label>

          <label>
            Modifier mode:
            <select data-testid="modifier-mode-select" [(ngModel)]="modifierDisplayMode">
              <option value="transition">Transition</option>
              <option value="hint">Hint</option>
            </select>
          </label>

          <label>
            <input type="checkbox" data-testid="open-toggle" [(ngModel)]="open" /> Open
          </label>

          <label>
            <input type="checkbox" data-testid="disabled-toggle" [(ngModel)]="disabled" /> Disabled
          </label>

          <label>
            <input type="checkbox" data-testid="echo-toggle" [(ngModel)]="showPhysicalEcho" />
            Physical echo
          </label>

          <label>
            <input type="checkbox" data-testid="floating-toggle" [(ngModel)]="floating" />
            Floating
          </label>
        </div>
      </header>

      <main>
        <textarea
          data-testid="text-output"
          [(ngModel)]="text"
          placeholder="Keyboard output appears here…"
          [rows]="4"
        ></textarea>

        <benin-keyboard
          #keyboard
          [attr.language]="language"
          [attr.theme]="theme"
          [attr.layout-variant]="layoutVariant"
          [attr.modifier-display-mode]="modifierDisplayMode"
          [attr.open]="open ? '' : null"
          [attr.disabled]="disabled ? '' : null"
          [attr.show-physical-echo]="showPhysicalEcho ? '' : null"
          [attr.floating]="floating ? '' : null"
          data-testid="keyboard"
        ></benin-keyboard>

        @if (error) {
          <div class="error-banner" data-testid="error-display" role="alert">
            {{ error }}
            <button (click)="error = null">Dismiss</button>
          </div>
        }
      </main>
    </div>
  `,
  styles: [
    `
      .app {
        font-family: system-ui, sans-serif;
        max-width: 900px;
        margin: 0 auto;
        padding: 1rem;
      }
      .app.dark {
        background: #1a1a1a;
        color: #e0e0e0;
      }
      .app.dark textarea,
      .app.dark select {
        background: #2a2a2a;
        color: #e0e0e0;
        border-color: #444;
      }
      .controls {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem 1.25rem;
        align-items: center;
        margin: 1rem 0;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 6px;
      }
      .app.dark .controls {
        border-color: #444;
      }
      textarea {
        width: 100%;
        font-size: 1.1rem;
        padding: 0.5rem;
        margin-bottom: 1rem;
        box-sizing: border-box;
      }
      .error-banner {
        background: #fee;
        border: 1px solid #c00;
        color: #900;
        padding: 0.75rem;
        border-radius: 4px;
        margin-top: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    `,
  ],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('keyboard', { static: false }) keyboardRef!: ElementRef<HTMLElement>;

  languages: Language[] = [
    { id: 'yoruba', label: 'Yoruba' },
    { id: 'fon-adja', label: 'Fon / Adja' },
    { id: 'baatonum', label: 'Baatonum' },
    { id: 'dendi', label: 'Dendi' },
  ];

  language = 'yoruba';
  theme = 'light';
  layoutVariant = 'desktop-azerty';
  modifierDisplayMode = 'transition';
  open = true;
  disabled = false;
  showPhysicalEcho = false;
  floating = false;
  text = '';
  error: string | null = null;

  private readonly handleKeyPress = (event: Event): void => {
    const { char } = (event as CustomEvent).detail as { char: string };
    if (char === '\b') {
      this.text = this.text.slice(0, -1);
    } else if (char === '\n') {
      this.text += '\n';
    } else {
      this.text += char;
    }
  };

  private readonly handleError = (event: Event): void => {
    const detail = (event as CustomEvent).detail as {
      code: string;
      message: string;
      recoverySuggestion: string;
    };
    this.error = `[${detail.code}] ${detail.message} — ${detail.recoverySuggestion}`;
  };

  ngAfterViewInit(): void {
    const el = this.keyboardRef.nativeElement;
    el.addEventListener('bboard-key-press', this.handleKeyPress);
    el.addEventListener('bboard-error', this.handleError);
  }

  ngOnDestroy(): void {
    const el = this.keyboardRef?.nativeElement;
    if (el) {
      el.removeEventListener('bboard-key-press', this.handleKeyPress);
      el.removeEventListener('bboard-error', this.handleError);
    }
  }
}
