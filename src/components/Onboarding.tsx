import { useState } from 'react';

const STEPS = [
  {
    title: 'Gemini Gem でJSON を取得',
    description: 'Gemini の広告点検 Gem にクリエイティブ画像をアップロードし、点検結果のJSONを取得します。',
    icon: '1',
  },
  {
    title: 'JSON を貼り付け',
    description: 'Gem が出力したJSONコードブロックのコピーボタンでコピーし、このツールのテキストエリアに貼り付けます。',
    icon: '2',
  },
  {
    title: '結果を確認',
    description: '「判定結果を表示」ボタンを押すと、OK / NG / 該当なし / 確認不可 の判定結果が一覧で表示されます。グラフやサマリをクリックして絞り込みもできます。',
    icon: '3',
  },
  {
    title: 'エクスポート',
    description: 'Google スプレッドシートへのコピーや、Excelファイルのダウンロードができます。',
    icon: '4',
  },
];

type Props = {
  onClose: () => void;
};

export function Onboarding({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  return (
    <div className="onboarding-overlay" onClick={onClose}>
      <div className="onboarding-modal" onClick={(e) => e.stopPropagation()}>
        <button className="onboarding-close" onClick={onClose} aria-label="閉じる">&times;</button>

        <div className="onboarding-content">
          <div className="onboarding-icon">{STEPS[step].icon}</div>
          <h2 className="onboarding-title">{STEPS[step].title}</h2>
          <p className="onboarding-description">{STEPS[step].description}</p>
        </div>

        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`onboarding-dot${i === step ? ' onboarding-dot--active' : ''}`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          {step > 0 && (
            <button className="btn-secondary" onClick={() => setStep(step - 1)}>
              戻る
            </button>
          )}
          <button
            className="btn-primary"
            onClick={isLast ? onClose : () => setStep(step + 1)}
          >
            {isLast ? 'はじめる' : '次へ'}
          </button>
        </div>
        {!isLast && (
          <button className="btn-ghost onboarding-skip" onClick={onClose}>
            スキップ
          </button>
        )}
      </div>
    </div>
  );
}
