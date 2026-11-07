import { useState } from 'react';
import { decodeBase64, encodeBase64, transformJson } from '@/lib/tools';

export default function TextTool({ kind }: { kind: 'json' | 'base64' }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(false);
  function run(action: 'format' | 'compact' | 'encode' | 'decode') {
    try {
      const result =
        action === 'encode'
          ? encodeBase64(input)
          : action === 'decode'
            ? decodeBase64(input)
            : transformJson(input, action === 'compact');
      setOutput(result);
      setError(false);
      setStatus('处理完成。');
    } catch (cause) {
      setOutput('');
      setError(true);
      setStatus((cause as Error).message);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setError(false);
      setStatus('结果已复制。');
    } catch {
      setError(true);
      setStatus('无法访问剪贴板，请手动复制结果。');
    }
  }
  return (
    <div className="tool-workspace" data-pagefind-ignore>
      <div className="tool-editors">
        <div>
          <label htmlFor="tool-input">输入内容</label>
          <textarea
            id="tool-input"
            spellCheck={false}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setStatus('');
            }}
            placeholder={
              kind === 'json'
                ? '{ "hello": "世界", "id": 9007199254740993 }'
                : '输入 UTF-8 文本或标准 Base64…'
            }
          />
        </div>
        <div>
          <label htmlFor="tool-output">处理结果</label>
          <textarea
            id="tool-output"
            spellCheck={false}
            value={output}
            readOnly
            placeholder="处理结果会显示在这里"
          />
        </div>
      </div>
      <div className="tool-controls">
        {kind === 'json' ? (
          <>
            <button className="button" onClick={() => run('format')}>
              校验并格式化
            </button>
            <button className="button secondary" onClick={() => run('compact')}>
              压缩
            </button>
          </>
        ) : (
          <>
            <button className="button" onClick={() => run('encode')}>
              编码 → Base64
            </button>
            <button className="button secondary" onClick={() => run('decode')}>
              解码 → 文本
            </button>
          </>
        )}
        <button
          className="button secondary"
          onClick={() => void copy()}
          disabled={!output}
        >
          复制结果
        </button>
        <button
          className="button secondary"
          onClick={() => {
            setInput('');
            setOutput('');
            setStatus('已清空。');
            setError(false);
          }}
        >
          清空
        </button>
      </div>
      <p className={`tool-status${error ? ' error' : ''}`} role="status">
        {status}
      </p>
    </div>
  );
}
