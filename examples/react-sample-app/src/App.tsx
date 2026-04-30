import { useCallback, useEffect, useRef, useState } from 'react';

type LanguageId = 'yoruba' | 'fon-adja' | 'baatonum' | 'dendi';

const LANGUAGES: { id: LanguageId; label: string }[] = [
  { id: 'yoruba', label: 'Yoruba' },
  { id: 'fon-adja', label: 'Fon / Adja' },
  { id: 'baatonum', label: 'Baatonum' },
  { id: 'dendi', label: 'Dendi' },
];

export default function App() {
  const [language, setLanguage] = useState<LanguageId>('yoruba');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const keyboardRef = useRef<HTMLElement>(null);

  // React 18 doesn't natively forward custom events from web components,
  // so we attach listeners via ref + useEffect.
  const handleKeyPress = useCallback((e: Event) => {
    const { char } = (e as CustomEvent).detail as { char: string };
    if (char === '\b') {
      setText((prev) => prev.slice(0, -1));
    } else if (char === '\n') {
      setText((prev) => prev + '\n');
    } else {
      setText((prev) => prev + char);
    }
  }, []);

  const handleError = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail as {
      code: string;
      message: string;
      recoverySuggestion: string;
    };
    setError(`[${detail.code}] ${detail.message} — ${detail.recoverySuggestion}`);
  }, []);

  useEffect(() => {
    const el = keyboardRef.current;
    if (!el) return;

    el.addEventListener('bboard-key-press', handleKeyPress);
    el.addEventListener('bboard-error', handleError);

    return () => {
      el.removeEventListener('bboard-key-press', handleKeyPress);
      el.removeEventListener('bboard-error', handleError);
    };
  }, [handleKeyPress, handleError]);

  return (
    <div className={`app ${theme}`}>
      <header>
        <h1>BBoard + React</h1>

        <div className="controls">
          <label htmlFor="language-select">Language: </label>
          <select
            id="language-select"
            data-testid="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageId)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>

          <button
            data-testid="theme-toggle"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          >
            Theme: {theme}
          </button>
        </div>
      </header>

      <main>
        <textarea
          data-testid="text-output"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Keyboard output appears here…"
          rows={4}
        />

        <benin-keyboard
          ref={keyboardRef}
          language={language}
          theme={theme}
          data-testid="keyboard"
        />

        {error && (
          <div className="error-banner" data-testid="error-display" role="alert">
            {error}
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
      </main>

      <style>{`
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
      `}</style>
    </div>
  );
}
