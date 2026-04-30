import 'b-board';

const output = document.getElementById('output') as HTMLTextAreaElement;
const keyboard = document.getElementById('kb')!;
const langSelect = document.getElementById('lang-select') as HTMLSelectElement;
const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;

keyboard.addEventListener('bboard-key-press', (e) => {
  const { char } = (e as CustomEvent<{ char: string }>).detail;
  const start = output.selectionStart ?? output.value.length;
  const end = output.selectionEnd ?? output.value.length;
  if (char === '\b') {
    if (start !== end) {
      output.value = output.value.slice(0, start) + output.value.slice(end);
      output.selectionStart = output.selectionEnd = start;
    } else if (start > 0) {
      output.value = output.value.slice(0, start - 1) + output.value.slice(start);
      output.selectionStart = output.selectionEnd = start - 1;
    }
  } else {
    output.value = output.value.slice(0, start) + char + output.value.slice(end);
    output.selectionStart = output.selectionEnd = start + char.length;
  }
  output.focus();
});

langSelect.addEventListener('change', () => {
  keyboard.setAttribute('language', langSelect.value);
});

themeSelect.addEventListener('change', () => {
  keyboard.setAttribute('theme', themeSelect.value);
});
