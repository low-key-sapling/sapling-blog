import { describe, expect, it } from 'vitest';
import {
  dateToTimestamp,
  decodeBase64,
  encodeBase64,
  timestampToDate,
  transformJson,
} from '../../src/lib/tools';

describe('strict JSON without numeric round-tripping', () => {
  const source =
    '{"id":9007199254740993,"decimal":1.234567890123456789,"exponent":1e1000,"zero":-0,"quoted":"a \\" b","arr":[true,null]}';
  it('preserves large integers, decimals, exponents and negative zero in both modes', () => {
    const formatted = transformJson(source);
    expect(formatted).toContain('\n  "id": 9007199254740993');
    expect(transformJson(formatted, true)).toBe(source);
  });
  it('keeps duplicate keys and whitespace inside strings', () => {
    expect(transformJson('{ "a": "a  b", "a": 2 }', true)).toBe(
      '{"a":"a  b","a":2}',
    );
  });
  it.each([
    '',
    '{',
    '{"a":1,}',
    '{/* comment */"a":1}',
    '[1,]',
    '{"a":NaN}',
    '{"n":01}',
    'true false',
    '"bad\nstring"',
    '[undefined]',
  ])('rejects invalid input: %s', (value) =>
    expect(() => transformJson(value)).toThrow('JSON 无效'),
  );
  it.each(['null', 'true', '123', '"你好"', '[]', '{}'])(
    'accepts a JSON root value: %s',
    (value) => expect(transformJson(value)).toBe(value),
  );
  it('reports a useful location', () =>
    expect(() => transformJson('{\n "a":\n}')).toThrow('第 3 行'));
});

describe('Base64 and UTF-8', () => {
  it.each(['', 'hello', '你好，世界 🌱', '𝒜 café e\u0301', '\u0000\n\t', '𠮷'])(
    'round-trips Unicode %s',
    (value) => expect(decodeBase64(encodeBase64(value))).toBe(value),
  );
  it('matches the standard encoding', () =>
    expect(encodeBase64('你好')).toBe('5L2g5aW9'));
  it.each([
    '!!!',
    'a',
    'abc',
    'a===',
    'AA=A',
    'SGV sbG8=',
    'AB==',
    'AAB=',
    '/w==',
  ])('rejects malformed Base64 or invalid UTF-8: %s', (value) =>
    expect(() => decodeBase64(value)).toThrow(),
  );
});

describe('timestamp conversion', () => {
  it('uses Beijing by explicit offset independent of the host timezone', () => {
    expect(timestampToDate('0', 'seconds', 'Asia/Shanghai')).toBe(
      '1970-01-01 08:00:00.000',
    );
    expect(
      dateToTimestamp('1970-01-01T08:00', 'seconds', 'Asia/Shanghai'),
    ).toBe('0');
  });
  it('preserves milliseconds and negative times', () => {
    expect(timestampToDate('-1', 'milliseconds', 'UTC')).toBe(
      '1969-12-31 23:59:59.999',
    );
    expect(dateToTimestamp('1969-12-31T23:59:59.999', 'seconds', 'UTC')).toBe(
      '-1',
    );
    expect(
      dateToTimestamp('1970-01-01 00:00:00.123', 'milliseconds', 'UTC'),
    ).toBe('123');
  });
  it('round-trips a leap date', () => {
    const value = '2024-02-29 12:13:14.015';
    expect(
      timestampToDate(
        dateToTimestamp(value, 'milliseconds', 'UTC'),
        'milliseconds',
        'UTC',
      ),
    ).toBe(value);
  });
  it.each([
    '2025-02-29T00:00',
    '2026-02-30T00:00',
    '2026-13-01T00:00',
    '2026-11-05T24:00',
    '2026-11-05T00:60',
    '2026-11-05',
    'yesterday',
  ])('rejects invalid date: %s', (value) =>
    expect(() => dateToTimestamp(value, 'seconds', 'UTC')).toThrow(),
  );
  it.each([
    '',
    '1.5',
    '1e3',
    'no',
    '9007199254740993',
    '999999999999999999999',
  ])('rejects invalid timestamp: %s', (value) =>
    expect(() => timestampToDate(value, 'milliseconds', 'UTC')).toThrow(),
  );
});
