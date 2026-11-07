import { useState } from 'react';
import {
  dateToTimestamp,
  timestampToDate,
  type TimeUnit,
  type TimeZone,
} from '@/lib/tools';

export default function TimestampTool() {
  const [unit, setUnit] = useState<TimeUnit>('milliseconds');
  const [zone, setZone] = useState<TimeZone>('Asia/Shanghai');
  const [timestamp, setTimestamp] = useState('');
  const [date, setDate] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(false);
  function convert(direction: 'toDate' | 'toTimestamp') {
    try {
      setResult(
        direction === 'toDate'
          ? timestampToDate(timestamp, unit, zone)
          : dateToTimestamp(date, unit, zone),
      );
      setError(false);
      setStatus(
        `转换完成 · ${zone === 'UTC' ? 'UTC' : '北京时间 UTC+8'} · ${unit === 'seconds' ? '秒' : '毫秒'}`,
      );
    } catch (cause) {
      setResult('');
      setError(true);
      setStatus((cause as Error).message);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(result);
      setError(false);
      setStatus('结果已复制。');
    } catch {
      setError(true);
      setStatus('无法访问剪贴板，请手动复制结果。');
    }
  }
  return (
    <div className="tool-workspace" data-pagefind-ignore>
      <div className="tool-controls">
        <div>
          <label htmlFor="time-unit">时间戳单位</label>
          <select
            id="time-unit"
            value={unit}
            onChange={(event) => {
              setUnit(event.target.value as TimeUnit);
              setResult('');
              setStatus('');
            }}
          >
            <option value="milliseconds">毫秒（ms）</option>
            <option value="seconds">秒（s）</option>
          </select>
        </div>
        <div>
          <label htmlFor="time-zone">日期时区</label>
          <select
            id="time-zone"
            value={zone}
            onChange={(event) => {
              setZone(event.target.value as TimeZone);
              setResult('');
              setStatus('');
            }}
          >
            <option value="Asia/Shanghai">北京时间（UTC+8）</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>
      <section className="time-section">
        <h2>时间戳 → 日期时间</h2>
        <div className="tool-controls">
          <div>
            <label htmlFor="timestamp-input">整数时间戳</label>
            <input
              id="timestamp-input"
              inputMode="numeric"
              value={timestamp}
              onChange={(event) => setTimestamp(event.target.value)}
              placeholder={
                unit === 'milliseconds' ? '1793851200000' : '1793851200'
              }
            />
          </div>
          <button className="button" onClick={() => convert('toDate')}>
            转为日期
          </button>
          <button
            className="button secondary"
            onClick={() =>
              setTimestamp(
                String(
                  unit === 'seconds'
                    ? Math.floor(Date.now() / 1000)
                    : Date.now(),
                ),
              )
            }
          >
            填入当前时间
          </button>
        </div>
      </section>
      <section className="time-section">
        <h2>日期时间 → 时间戳</h2>
        <div className="tool-controls">
          <div>
            <label htmlFor="date-input">日期时间（所选时区）</label>
            <input
              id="date-input"
              type="datetime-local"
              step="0.001"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <button className="button" onClick={() => convert('toTimestamp')}>
            转为时间戳
          </button>
        </div>
      </section>
      {result && (
        <>
          <output
            className="time-result"
            style={{ display: 'block' }}
            aria-label="转换结果"
          >
            {result}
          </output>
          <button className="button secondary" onClick={() => void copy()}>
            复制结果
          </button>
        </>
      )}
      <p className={`tool-status${error ? ' error' : ''}`} role="status">
        {status}
      </p>
      <p className="tool-privacy">
        北京时间按固定 UTC+8
        转换，不包含历史夏令时。转换为秒时向下取整，毫秒精度请选「毫秒」。
      </p>
    </div>
  );
}
