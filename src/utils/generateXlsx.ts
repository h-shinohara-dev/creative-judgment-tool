import * as XLSX from 'xlsx';
import type { AdEvaluation } from '../types/evaluation.ts';

export function downloadAsXlsx(data: AdEvaluation): void {
  const headers = [
    "No.",
    "カテゴリ",
    "チェック項目",
    "判定",
    "抽出テキスト",
    "備考",
    "改善案",
  ];

  const rows = data.checkItems.map((c) => [
    c.id,
    c.category,
    c.item,
    c.verdict,
    c.extractedText ?? "",
    c.reason ?? "",
    c.improvement ?? "",
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  ws['!cols'] = [
    { wch: 5 },
    { wch: 16 },
    { wch: 40 },
    { wch: 10 },
    { wch: 50 },
    { wch: 50 },
    { wch: 50 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "点検結果");

  const filename = `${data.adName || "ad_check"}_点検結果.xlsx`;
  XLSX.writeFile(wb, filename);
}
