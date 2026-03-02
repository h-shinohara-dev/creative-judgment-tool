import type { AdEvaluation } from '../types/evaluation.ts';

const HEADERS = ["No.", "カテゴリ", "チェック項目", "判定", "抽出テキスト", "備考", "改善案"];

/** HTML table with inline styles — Google Sheets preserves these on paste */
export function evaluationToHtml(data: AdEvaluation): string {
  const thStyle = 'background:#e2e8f0;font-weight:bold;padding:4px 8px;border:1px solid #ccc;font-size:13px';
  const headerRow = HEADERS.map((h) => `<th style="${thStyle}">${h}</th>`).join('');

  const bodyRows = data.checkItems.map((c) => {
    const isNg = c.verdict === 'NG';
    const isUnknown = c.verdict === '判定不可' || c.verdict === '確認不可';

    const cellStyle = 'padding:4px 8px;border:1px solid #ccc;font-size:13px';
    const verdictStyle = isNg
      ? `${cellStyle};background:#fff3cd;color:#cc0000;font-weight:bold`
      : isUnknown
        ? `${cellStyle};background:#fff3cd;color:#996600`
        : `${cellStyle};background:#fff3cd`;
    const ngTextStyle = isNg ? `${cellStyle};color:#cc0000` : cellStyle;

    return `<tr>
      <td style="${cellStyle}">${c.id}</td>
      <td style="${cellStyle}">${c.category}</td>
      <td style="${cellStyle}">${c.item}</td>
      <td style="${verdictStyle}">${c.verdict}</td>
      <td style="${cellStyle}">${c.extractedText ?? ''}</td>
      <td style="${ngTextStyle}">${c.reason ?? ''}</td>
      <td style="${cellStyle}">${c.improvement ?? ''}</td>
    </tr>`;
  }).join('');

  return `<table>${headerRow}${bodyRows}</table>`;
}

/** Plain TSV fallback */
export function evaluationToTsv(data: AdEvaluation): string {
  const rows = data.checkItems.map((c) => [
    String(c.id),
    c.category,
    c.item,
    c.verdict,
    c.extractedText ?? "",
    c.reason ?? "",
    c.improvement ?? "",
  ]);

  return [HEADERS, ...rows].map((row) => row.join("\t")).join("\n");
}
