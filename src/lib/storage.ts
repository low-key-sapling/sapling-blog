export interface ReadingState {
  bookmarks: string[];
  positions: Record<string, { progress: number; updatedAt: number }>;
}
export const STORAGE_KEY = 'sapling:reading:v1';
const empty = (): ReadingState => ({ bookmarks: [], positions: {} });

// localStorage is an external boundary: private mode and corrupt data must not break reading.
export function readState(): ReadingState {
  try {
    const raw: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? 'null',
    );
    if (!raw || typeof raw !== 'object') return empty();
    const { bookmarks, positions } = raw as ReadingState;
    if (
      !Array.isArray(bookmarks) ||
      !bookmarks.every((id) => typeof id === 'string') ||
      !positions ||
      typeof positions !== 'object' ||
      Array.isArray(positions)
    )
      return empty();
    if (
      !Object.values(positions).every(
        (p) =>
          p &&
          typeof p.progress === 'number' &&
          p.progress >= 0 &&
          p.progress <= 1 &&
          Number.isFinite(p.updatedAt),
      )
    )
      return empty();
    return { bookmarks: [...new Set(bookmarks)], positions };
  } catch {
    return empty();
  }
}

export function writeState(state: ReadingState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('reading-state-changed'));
    return true;
  } catch {
    return false;
  }
}

export function toggleBookmark(id: string): boolean {
  const state = readState();
  state.bookmarks = state.bookmarks.includes(id)
    ? state.bookmarks.filter((item) => item !== id)
    : [...state.bookmarks, id];
  return writeState(state);
}

export function savePosition(id: string, progress: number): boolean {
  const state = readState();
  state.positions[id] = { progress, updatedAt: Date.now() };
  return writeState(state);
}
