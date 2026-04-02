import { isLanguageId, type LanguageId } from '../public/types.js';

export class BeninKeyboard extends HTMLElement {
  private _language: LanguageId = 'yoruba';

  constructor() {
    super();
    // Lifecycle setup will go here
  }

  static get observedAttributes(): string[] {
    return ['language'];
  }

  connectedCallback(): void {
    // Engine initialization will happen here
  }

  disconnectedCallback(): void {
    // Cleanup
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    if (name === 'language' && isLanguageId(newValue)) {
      this.language = newValue;
    }
  }

  get language(): LanguageId {
    return this._language;
  }

  set language(value: LanguageId) {
    if (isLanguageId(value) && this._language !== value) {
      this._language = value;
      this.setAttribute('language', value);
      // Event emission will be wired here later
    }
  }
}

if (!customElements.get('benin-keyboard')) {
  customElements.define('benin-keyboard', BeninKeyboard);
}
