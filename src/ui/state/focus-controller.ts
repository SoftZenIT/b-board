import type { KeyId } from '../../public/index.js';

type FocusGrid = readonly (readonly KeyId[])[];
type FocusMove = 'tab' | 'shift-tab' | 'arrow-left' | 'arrow-right' | 'arrow-up' | 'arrow-down';

export function createFocusController(grid: FocusGrid) {
  function locate(current: KeyId | null): { rowIndex: number; columnIndex: number } {
    if (current === null) return { rowIndex: 0, columnIndex: -1 };
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex += 1) {
      const columnIndex = grid[rowIndex].indexOf(current);
      if (columnIndex !== -1) return { rowIndex, columnIndex };
    }
    return { rowIndex: 0, columnIndex: -1 };
  }

  return {
    move(direction: FocusMove, current: KeyId | null): KeyId | null {
      const { rowIndex, columnIndex } = locate(current);
      if (direction === 'tab') {
        const flat = grid.flat();
        const index = current === null ? -1 : flat.indexOf(current);
        return flat[index + 1] ?? flat[0] ?? null;
      }
      if (direction === 'shift-tab') {
        const flat = grid.flat();
        if (current === null) return flat[flat.length - 1] ?? null;
        const index = flat.indexOf(current);
        return flat[index - 1] ?? flat[flat.length - 1] ?? null;
      }
      if (direction === 'arrow-down') {
        return grid[rowIndex + 1]?.[Math.max(columnIndex, 0)] ?? current;
      }
      if (direction === 'arrow-up') {
        return grid[rowIndex - 1]?.[Math.max(columnIndex, 0)] ?? current;
      }
      if (direction === 'arrow-right') {
        return grid[rowIndex]?.[columnIndex + 1] ?? current;
      }
      if (direction === 'arrow-left') {
        return grid[rowIndex]?.[columnIndex - 1] ?? current;
      }
      return current;
    },
  };
}
