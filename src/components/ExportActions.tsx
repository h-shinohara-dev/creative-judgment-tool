import { useState } from 'react';
import type { AdEvaluation } from '../types/evaluation.ts';
import { evaluationToHtml, evaluationToTsv } from '../utils/formatTsv.ts';
import { downloadAsXlsx } from '../utils/generateXlsx.ts';

type Props = {
  data: AdEvaluation;
  onReset: () => void;
};

export function ExportActions({ data, onReset }: Props) {
  const [copied, setCopied] = useState(false);

  const handleSpreadsheet = async () => {
    const html = evaluationToHtml(data);
    const tsv = evaluationToTsv(data);

    try {
      // Copy as HTML so Google Sheets preserves colors
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([tsv], { type: 'text/plain' }),
        }),
      ]);
    } catch {
      // Fallback: plain text copy
      await navigator.clipboard.writeText(tsv).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = tsv;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      });
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    window.open('https://sheets.google.com/create', '_blank');
  };

  const handleXlsx = () => {
    downloadAsXlsx(data);
  };

  return (
    <div className="export-actions">
      <button className="btn-primary btn-export" onClick={handleSpreadsheet}>
        {copied ? 'コピー済み! シートで Cmd+V で貼り付け' : 'Google スプレッドシートを作成'}
      </button>
      <button className="btn-secondary" onClick={handleXlsx}>
        Excel ダウンロード (.xlsx)
      </button>
      <button className="btn-ghost" onClick={onReset}>
        やり直す
      </button>
      {copied && (
        <div className="toast">
          データをクリップボードにコピーしました。新しいスプレッドシートで Cmd+V で貼り付けてください。
        </div>
      )}
    </div>
  );
}
