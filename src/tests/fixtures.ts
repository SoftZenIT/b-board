export const createMockElement = (tag: string = 'div') => {
  return document.createElement(tag);
};

export const createMockInput = (value: string = '') => {
  const input = document.createElement('input');
  input.value = value;
  return input;
};

export const createMockTextarea = (value: string = '') => {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  return textarea;
};
