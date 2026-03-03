import { useState, useCallback } from 'react';
import type { AdEvaluation } from './types/evaluation.ts';
import { JsonInput } from './components/JsonInput.tsx';
import { EvaluationPreview } from './components/EvaluationPreview.tsx';
import { ExportActions } from './components/ExportActions.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import './App.css';

type View = 'input' | 'preview';

const ONBOARDING_KEY = 'creative-judge-onboarding-done';

export function App() {
  const [data, setData] = useState<AdEvaluation | null>(null);
  const [view, setView] = useState<View>('input');
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );

  const handleParse = useCallback((result: AdEvaluation) => {
    setData(result);
    setView('preview');
  }, []);

  const handleReset = useCallback(() => {
    setData(null);
    setView('input');
  }, []);

  const handleCloseOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, '1');
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>クリエイティブ判定ツール</h1>
        <span className="app-subtitle">Gemini Gem 広告点検結果ビューア</span>
        <button className="btn-help" onClick={() => setShowOnboarding(true)}>
          ?
        </button>
      </header>

      <main className="app-main">
        {view === 'input' && <JsonInput onParse={handleParse} />}
        {view === 'preview' && data && (
          <>
            <ExportActions data={data} onReset={handleReset} />
            <EvaluationPreview data={data} />
            <ExportActions data={data} onReset={handleReset} />
          </>
        )}
      </main>

      {showOnboarding && <Onboarding onClose={handleCloseOnboarding} />}
    </div>
  );
}
