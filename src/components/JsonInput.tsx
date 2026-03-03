import { useState } from 'react';
import type { AdEvaluation } from '../types/evaluation.ts';
import { parseEvaluationJson } from '../utils/parseJson.ts';
import { SAMPLE_JSON } from '../utils/sampleData.ts';

type Props = {
  onParse: (data: AdEvaluation) => void;
};

export function JsonInput({ onParse }: Props) {
  const [rawJson, setRawJson] = useState('');
  const [error, setError] = useState('');

  const handleParse = () => {
    try {
      const result = parseEvaluationJson(rawJson);
      setError('');
      onParse(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    }
  };

  const handleDemo = () => {
    setRawJson(SAMPLE_JSON);
    setError('');
  };

  return (
    <div className="json-input">
      <h2>Gemini Gem 判定結果を入力</h2>
      <div className="json-input__hint">
        <span className="json-input__hint-icon">&#x1F4CB;</span>
        Gem の JSON コードブロック右上のコピーボタンでコピーし、下のエリアに Ctrl+V で貼り付けてください
      </div>
      <textarea
        value={rawJson}
        onChange={(e) => setRawJson(e.target.value)}
        placeholder={'[\n  {\n    "No": 1,\n    "カテゴリ": "デザイン",\n    "チェック項目": "構成",\n    "判定": "OK",\n    "抽出テキスト": "...",\n    "備考": "情報の優先順位が明確です。"\n  }\n]'}
        rows={18}
        spellCheck={false}
      />
      {error && <div className="error-message">{error}</div>}
      <div className="input-actions">
        <button className="btn-secondary" onClick={handleDemo}>
          デモデータで試す
        </button>
        <button className="btn-primary" onClick={handleParse} disabled={!rawJson.trim()}>
          判定結果を表示
        </button>
      </div>
    </div>
  );
}
