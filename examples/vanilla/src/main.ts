import 'b-board';

const output = document.getElementById('output') as HTMLTextAreaElement;
const keyboard = document.getElementById('kb')!;
const langSelect = document.getElementById('lang-select') as HTMLSelectElement;
const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
const layoutSelect = document.getElementById('layout-select') as HTMLSelectElement;
const modifierModeSelect = document.getElementById('modifier-mode-select') as HTMLSelectElement;
const openToggle = document.getElementById('open-toggle') as HTMLInputElement;
const disabledToggle = document.getElementById('disabled-toggle') as HTMLInputElement;
const echoToggle = document.getElementById('echo-toggle') as HTMLInputElement;

(keyboard as any).attach(output);

langSelect.addEventListener('change', () => {
  keyboard.setAttribute('language', langSelect.value);
});

themeSelect.addEventListener('change', () => {
  keyboard.setAttribute('theme', themeSelect.value);
  document.body.className = themeSelect.value === 'dark' ? 'dark' : '';
});

layoutSelect.addEventListener('change', () => {
  keyboard.setAttribute('layout-variant', layoutSelect.value);
});

modifierModeSelect.addEventListener('change', () => {
  keyboard.setAttribute('modifier-display-mode', modifierModeSelect.value);
});

openToggle.addEventListener('change', () => {
  if (openToggle.checked) {
    keyboard.setAttribute('open', '');
  } else {
    keyboard.removeAttribute('open');
  }
});

disabledToggle.addEventListener('change', () => {
  if (disabledToggle.checked) {
    keyboard.setAttribute('disabled', '');
  } else {
    keyboard.removeAttribute('disabled');
  }
});

echoToggle.addEventListener('change', () => {
  if (echoToggle.checked) {
    keyboard.setAttribute('show-physical-echo', '');
  } else {
    keyboard.removeAttribute('show-physical-echo');
  }
});

const floatingToggle = document.getElementById('floating-toggle') as HTMLInputElement;

floatingToggle.addEventListener('change', () => {
  if (floatingToggle.checked) {
    keyboard.setAttribute('floating', '');
  } else {
    keyboard.removeAttribute('floating');
  }
});
