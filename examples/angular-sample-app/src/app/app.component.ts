import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
          <label for="language-select">Language: </label>
          <select id="language-select" data-testid="language-select" [(ngModel)]="language">
            @for (l of languages; track l.id) {
              <option [value]="l.id">{{ l.label }}</option>
            }
          </select>

          <button data-testid="theme-toggle" (click)="toggleTheme()">Theme: {{ theme }}</button>
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
          [attr.language]="language"
          [attr.theme]="theme"
          data-testid="keyboard"
          (bboard-key-press)="onKeyPress($event)"
          (bboard-error)="onError($event)"
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
      .controls {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin: 1rem 0;
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
export class AppComponent {
  languages: Language[] = [
    { id: 'yoruba', label: 'Yoruba' },
    { id: 'fon-adja', label: 'Fon / Adja' },
    { id: 'baatonum', label: 'Baatonum' },
    { id: 'dendi', label: 'Dendi' },
  ];

  language = 'yoruba';
  theme: 'light' | 'dark' = 'light';
  text = '';
  error: string | null = null;

  onKeyPress(event: Event): void {
    const detail = (event as CustomEvent).detail as { char: string };
    this.text += detail.char;
  }

  onError(event: Event): void {
    const detail = (event as CustomEvent).detail as {
      code: string;
      message: string;
      recoverySuggestion: string;
    };
    this.error = `[${detail.code}] ${detail.message} — ${detail.recoverySuggestion}`;
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  }
}
