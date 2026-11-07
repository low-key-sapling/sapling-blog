import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  readState,
  savePosition,
  STORAGE_KEY,
  toggleBookmark,
} from '../../src/lib/storage';

describe('browser storage boundary', () => {
  let records: Map<string, string>;
  beforeEach(() => {
    records = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => records.get(key) ?? null,
      setItem: (key: string, value: string) => records.set(key, value),
    });
    vi.stubGlobal('window', { dispatchEvent: vi.fn() });
  });
  afterEach(() => vi.unstubAllGlobals());
  it('adds, restores and removes bookmarks', () => {
    expect(toggleBookmark('digital-garden')).toBe(true);
    expect(readState().bookmarks).toEqual(['digital-garden']);
    toggleBookmark('digital-garden');
    expect(readState().bookmarks).toEqual([]);
  });
  it('updates progress without losing bookmarks', () => {
    toggleBookmark('digital-garden');
    savePosition('digital-garden', 0.4);
    expect(readState().positions['digital-garden'].progress).toBe(0.4);
    expect(readState().bookmarks).toEqual(['digital-garden']);
  });
  it.each([
    'broken',
    'null',
    '[]',
    '{"bookmarks":[1],"positions":{}}',
    '{"bookmarks":[],"positions":{"x":{"progress":2,"updatedAt":0}}}',
  ])('ignores corrupt records: %s', (value) => {
    records.set(STORAGE_KEY, value);
    expect(readState()).toEqual({ bookmarks: [], positions: {} });
  });
  it('survives denied reads and writes', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    });
    expect(readState()).toEqual({ bookmarks: [], positions: {} });
    expect(toggleBookmark('digital-garden')).toBe(false);
    expect(savePosition('digital-garden', 0.5)).toBe(false);
  });
});
