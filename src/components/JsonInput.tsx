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
      <textarea
        value={rawJson}
        onChange={(e) => setRawJson(e.target.value)}
        placeholder={'{\n  "adName": "広告名",\n  "advertiser": "広告主名",\n  "industry": "通信",\n  "evaluatedAt": "2026-03-01T10:00:00Z",\n  "checkItems": [\n    {\n      "id": 1,\n      "category": "通信速度表示",\n      "item": "ベストエフォートである旨の記載があるか",\n      "verdict": "OK",\n      "reason": null,\n      "improvement": null\n    }\n  ]\n}'}
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
