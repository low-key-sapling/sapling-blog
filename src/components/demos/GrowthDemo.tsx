import { useEffect, useState } from 'react';

export default function GrowthDemo() {
  const [growth, setGrowth] = useState(12);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const values = Array.from({ length: 8 }, (_, index) =>
    Math.round(20 * (1 + growth / 100) ** index),
  );
  return (
    <div className="demo" data-pagefind-ignore>
      <label htmlFor="growth">
        每一步增长 {growth}%
        <input
          id="growth"
          type="range"
          min="0"
          max="25"
          disabled={!ready}
          value={growth}
          onChange={(event) => setGrowth(Number(event.target.value))}
        />
      </label>
      <p aria-live="polite">
        从 20 开始，经过 7 步后变为 <strong>{values[7]}</strong>。
      </p>
      <div className="demo-bars" aria-hidden="true">
        {values.map((value, index) => (
          <span key={index} style={{ height: `${value}%` }} />
        ))}
      </div>
      <small>拖动滑块，观察持续积累的变化。示例数据，无真实业务含义。</small>
    </div>
  );
}
