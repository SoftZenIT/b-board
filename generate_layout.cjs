const fs = require('fs');

const createRow1 = (suffix = '') => [
  { keyId: "key-backquote" + suffix, width: 1, label: suffix ? "" : "`" },
  { keyId: "key-1" + suffix, width: 1, label: suffix ? "" : "1" },
  { keyId: "key-2" + suffix, width: 1, label: suffix ? "" : "2" },
  { keyId: "key-3" + suffix, width: 1, label: suffix ? "" : "3" },
  { keyId: "key-4" + suffix, width: 1, label: suffix ? "" : "4" },
  { keyId: "key-5" + suffix, width: 1, label: suffix ? "" : "5" },
  { keyId: "key-6" + suffix, width: 1, label: suffix ? "" : "6" },
  { keyId: "key-7" + suffix, width: 1, label: suffix ? "" : "7" },
  { keyId: "key-8" + suffix, width: 1, label: suffix ? "" : "8" },
  { keyId: "key-9" + suffix, width: 1, label: suffix ? "" : "9" },
  { keyId: "key-0" + suffix, width: 1, label: suffix ? "" : "0" },
  { keyId: "key-minus" + suffix, width: 1, label: suffix ? "" : "-" },
  { keyId: "key-equal" + suffix, width: 1, label: suffix ? "" : "=" },
  { keyId: "key-backspace" + suffix, width: 2, label: "⌫" }
];

const createRow2 = (suffix = '') => [
  { keyId: "key-tab" + suffix, width: 1.5, label: "⇥" },
  { keyId: "key-a" + suffix, width: 1 },
  { keyId: "key-z" + suffix, width: 1 },
  { keyId: "key-e" + suffix, width: 1 },
  { keyId: "key-r" + suffix, width: 1 },
  { keyId: "key-t" + suffix, width: 1 },
  { keyId: "key-y" + suffix, width: 1 },
  { keyId: "key-u" + suffix, width: 1 },
  { keyId: "key-i" + suffix, width: 1 },
  { keyId: "key-o" + suffix, width: 1 },
  { keyId: "key-p" + suffix, width: 1 },
  { keyId: "key-bracketleft" + suffix, width: 1, label: suffix ? "" : "[" },
  { keyId: "key-bracketright" + suffix, width: 1, label: suffix ? "" : "]" },
  { keyId: "key-backslash" + suffix, width: 1.5, label: suffix ? "" : "\\" }
];

const createRow3 = (suffix = '') => [
  { keyId: "key-capslock" + suffix, width: 1.75, label: "⇪" },
  { keyId: "key-q" + suffix, width: 1 },
  { keyId: "key-s" + suffix, width: 1 },
  { keyId: "key-d" + suffix, width: 1 },
  { keyId: "key-f" + suffix, width: 1 },
  { keyId: "key-g" + suffix, width: 1 },
  { keyId: "key-h" + suffix, width: 1 },
  { keyId: "key-j" + suffix, width: 1 },
  { keyId: "key-k" + suffix, width: 1 },
  { keyId: "key-l" + suffix, width: 1 },
  { keyId: "key-m" + suffix, width: 1 },
  { keyId: "key-quote" + suffix, width: 1, label: suffix ? "" : "'" },
  { keyId: "key-enter" + suffix, width: 2.25, label: "⏎" }
];

const createRow4 = (suffix = '') => [
  { keyId: "key-shift" + suffix, width: 2.25, label: "⇧" },
  { keyId: "key-w" + suffix, width: 1 },
  { keyId: "key-x" + suffix, width: 1 },
  { keyId: "key-c" + suffix, width: 1 },
  { keyId: "key-v" + suffix, width: 1 },
  { keyId: "key-b" + suffix, width: 1 },
  { keyId: "key-n" + suffix, width: 1 },
  { keyId: "key-e-dot" + suffix, width: 1 },
  { keyId: "key-o-dot" + suffix, width: 1 },
  { keyId: "key-comma" + suffix, width: 1, label: suffix ? "" : "," },
  { keyId: "key-period" + suffix, width: 1, label: suffix ? "" : "." },
  { keyId: "key-shift-right" + suffix, width: 2.75, label: "⇧" }
];

const createRow5 = (suffix = '') => [
  { keyId: "key-ctrl" + suffix, width: 1.25, label: "Ctrl" },
  { keyId: "key-win" + suffix, width: 1.25, label: "Win" },
  { keyId: "key-alt" + suffix, width: 1.25, label: "Alt" },
  { keyId: "key-space" + suffix, width: 6.25, label: " " },
  { keyId: "key-altgr" + suffix, width: 1.25, label: "AltGr" },
  { keyId: "key-win-right" + suffix, width: 1.25, label: "Win" },
  { keyId: "key-menu" + suffix, width: 1.25, label: "Menu" },
  { keyId: "key-ctrl-right" + suffix, width: 1.25, label: "Ctrl" }
];

const createLayer = (name, suffix) => ({
  name,
  rows: [
    { slots: createRow1(suffix) },
    { slots: createRow2(suffix) },
    { slots: createRow3(suffix) },
    { slots: createRow4(suffix) },
    { slots: createRow5(suffix) }
  ]
});

const layout = {
  id: "desktop-azerty",
  variant: "desktop",
  theme: "light",
  layers: [
    createLayer("base", ""),
    createLayer("shift", "-shift"),
    createLayer("altGr", "-altgr")
  ]
};

fs.writeFileSync('data/layouts/desktop-azerty.json', JSON.stringify(layout, null, 2));
console.log("Updated data/layouts/desktop-azerty.json");
