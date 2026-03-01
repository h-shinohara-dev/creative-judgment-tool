import { useState, useCallback } from 'react';
import type { AdEvaluation } from './types/evaluation.ts';
import { JsonInput } from './components/JsonInput.tsx';
import { EvaluationPreview } from './components/EvaluationPreview.tsx';
import { ExportActions } from './components/ExportActions.tsx';
import './App.css';

type View = 'input' | 'preview';

export function App() {
  const [data, setData] = useState<AdEvaluation | null>(null);
  const [view, setView] = useState<View>('input');

  const handleParse = useCallback((result: AdEvaluation) => {
    setData(result);
    setView('preview');
  }, []);

  const handleReset = useCallback(() => {
    setData(null);
    setView('input');
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>クリエイティブ判定ツール</h1>
        <span className="app-subtitle">Gemini Gem 広告点検結果ビューア</span>
      </header>

      <main className="app-main">
        {view === 'input' && <JsonInput onParse={handleParse} />}
        {view === 'preview' && data && (
          <>
            <EvaluationPreview data={data} />
            <ExportActions data={data} onReset={handleReset} />
          </>
        )}
      </main>
    </div>
  );
}
