import {
  applyEdits,
  createScanner,
  format,
  parse,
  printParseErrorCode,
  type ParseError,
} from 'jsonc-parser';

export function transformJson(input: string, compact = false): string {
  const errors: ParseError[] = [];
  parse(input, errors, {
    disallowComments: true,
    allowTrailingComma: false,
    allowEmptyContent: false,
  });
  if (errors.length) {
    const error = errors[0];
    const before = input.slice(0, error.offset).split('\n');
    throw new Error(
      `JSON 无效：第 ${before.length} 行，第 ${before.at(-1)!.length + 1} 列（${printParseErrorCode(error.error)}）`,
    );
  }
  // Only whitespace is edited; numeric lexemes never pass through JSON.stringify.
  if (!compact)
    return applyEdits(
      input,
      format(input, undefined, { tabSize: 2, insertSpaces: true, eol: '\n' }),
    ).trim();
  const scanner = createScanner(input, true);
  let output = '';
  while (scanner.getPosition() < input.length) {
    scanner.scan();
    output += input.slice(
      scanner.getTokenOffset(),
      scanner.getTokenOffset() + scanner.getTokenLength(),
    );
  }
  return output;
}

export function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
}

export function decodeBase64(input: string): string {
  const value = input.trim();
  if (
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      value,
    )
  )
    throw new Error('请输入合法的标准 Base64 文本（包含正确的 = 填充）。');
  const binary = atob(value);
  if (btoa(binary) !== value) throw new Error('Base64 填充位无效。');
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(
      Uint8Array.from(binary, (char) => char.charCodeAt(0)),
    );
  } catch {
    throw new Error('解码结果不是有效的 UTF-8 文本。');
  }
}

export type TimeZone = 'Asia/Shanghai' | 'UTC';
export type TimeUnit = 'seconds' | 'milliseconds';

export function timestampToDate(
  input: string,
  unit: TimeUnit,
  zone: TimeZone,
): string {
  if (!/^-?\d+$/.test(input.trim())) throw new Error('时间戳必须是整数。');
  const timestamp = Number(input) * (unit === 'seconds' ? 1000 : 1);
  const date = new Date(
    timestamp + (zone === 'Asia/Shanghai' ? 8 * 3600_000 : 0),
  );
  if (
    !Number.isSafeInteger(timestamp) ||
    !Number.isFinite(date.getTime()) ||
    date.getUTCFullYear() < 0 ||
    date.getUTCFullYear() > 9999
  )
    throw new Error('时间戳超出支持的日期范围（0000—9999 年）。');
  return date.toISOString().slice(0, 23).replace('T', ' ');
}

export function dateToTimestamp(
  input: string,
  unit: TimeUnit,
  zone: TimeZone,
): string {
  const match =
    /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(
      input,
    );
  if (!match) throw new Error('请输入完整日期时间，例如 2026-11-05 12:30:00。');
  const canonical = `${match[1]} ${match[2]}:${match[3] ?? '00'}.${(match[4] ?? '0').padEnd(3, '0')}`;
  const time = new Date(
    canonical.replace(' ', 'T') + (zone === 'Asia/Shanghai' ? '+08:00' : 'Z'),
  ).getTime();
  if (
    !Number.isFinite(time) ||
    timestampToDate(String(time), 'milliseconds', zone) !== canonical
  )
    throw new Error('日期时间无效，请检查年月日及时间。');
  return String(unit === 'seconds' ? Math.floor(time / 1000) : time);
}
