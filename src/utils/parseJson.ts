import type { AdEvaluation, CheckItem, Verdict } from '../types/evaluation.ts';

const VALID_VERDICTS: Verdict[] = ["OK", "NG", "該当なし", "確認不可", "判定不可"];

/** Clean raw input: strip markdown fences, smart quotes, citation markers, invisible chars */
function sanitizeRawInput(raw: string): string {
  let s = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  s = s.replace(/^```(?:json|JSON)?\s*\n?/, '').replace(/\n?```\s*$/, '');

  // Replace smart quotes with standard quotes
  s = s.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
  s = s.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");

  // Strip Gemini citation markers
  s = s.replace(/\[cite_start\]/g, '');
  s = s.replace(/\[cite_end\]/g, '');
  s = s.replace(/\[cite:\s*[^\]]*\]/g, '');

  // Strip invisible characters
  s = s.replace(/\u200B/g, '');    // zero-width space
  s = s.replace(/\uFEFF/g, '');    // BOM
  s = s.replace(/\u00A0/g, ' ');   // non-breaking space → normal space

  return s;
}

/** Remove citation markers from parsed string values */
function cleanCitations(text: string): string {
  return text
    .replace(/\[cite_start\]/g, '')
    .replace(/\[cite_end\]/g, '')
    .replace(/\[cite:\s*[^\]]*\]/g, '')
    .trim();
}

/** Detect and convert Gemini Gem flat-array format to internal format */
function isGeminiFormat(parsed: unknown): parsed is Record<string, unknown>[] {
  if (!Array.isArray(parsed) || parsed.length === 0) return false;
  const first = parsed[0];
  if (!first || typeof first !== 'object') return false;
  const obj = first as Record<string, unknown>;
  return 'チェック項目' in obj || '判定' in obj || 'カテゴリ' in obj;
}

function convertGeminiItem(raw: Record<string, unknown>, index: number): CheckItem {
  const item = typeof raw['チェック項目'] === 'string' ? raw['チェック項目'] : '';
  if (!item) {
    throw new Error(`項目[${index}]: チェック項目が必要です`);
  }

  const rawVerdict = typeof raw['判定'] === 'string' ? raw['判定'] : '';
  const verdict: Verdict = VALID_VERDICTS.includes(rawVerdict as Verdict)
    ? (rawVerdict as Verdict)
    : '判定不可';

  const rawReason = typeof raw['備考'] === 'string' && raw['備考']
    ? cleanCitations(raw['備考'])
    : null;

  const rawExtracted = typeof raw['抽出テキスト'] === 'string' && raw['抽出テキスト']
    ? raw['抽出テキスト']
    : null;

  return {
    id: typeof raw['No'] === 'number' ? raw['No'] : index + 1,
    category: typeof raw['カテゴリ'] === 'string' ? raw['カテゴリ'] : 'その他',
    item,
    verdict,
    extractedText: rawExtracted,
    reason: rawReason,
    improvement: null,
  };
}

function convertGeminiFormat(items: Record<string, unknown>[]): AdEvaluation {
  const checkItems = items.map((raw, i) => convertGeminiItem(raw, i));

  return {
    adName: '広告点検結果',
    evaluatedAt: new Date().toISOString(),
    checkItems,
  };
}

function validateCheckItem(raw: unknown, index: number): CheckItem {
  if (!raw || typeof raw !== "object") {
    throw new Error(`checkItems[${index}]: オブジェクトではありません`);
  }
  const obj = raw as Record<string, unknown>;

  if (typeof obj.item !== "string" || !obj.item) {
    throw new Error(`checkItems[${index}]: item（点検項目名）が必要です`);
  }

  const verdict: Verdict =
    typeof obj.verdict === "string" && VALID_VERDICTS.includes(obj.verdict as Verdict)
      ? (obj.verdict as Verdict)
      : "判定不可";

  return {
    id: typeof obj.id === "number" ? obj.id : index + 1,
    category: typeof obj.category === "string" ? obj.category : "その他",
    item: obj.item as string,
    verdict,
    extractedText: typeof obj.extractedText === "string" && obj.extractedText ? obj.extractedText : null,
    reason: typeof obj.reason === "string" && obj.reason ? obj.reason : null,
    improvement: typeof obj.improvement === "string" && obj.improvement ? obj.improvement : null,
  };
}

export function parseEvaluationJson(raw: string): AdEvaluation {
  if (!raw.trim()) {
    throw new Error("JSONを入力してください");
  }

  // Clean raw input: markdown fences, smart quotes, citation markers, invisible chars
  const cleaned = sanitizeRawInput(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("JSONの形式が正しくありません。構文を確認してください");
  }

  // Gemini Gem format: flat array with Japanese keys
  if (isGeminiFormat(parsed)) {
    return convertGeminiFormat(parsed as Record<string, unknown>[]);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("JSONはオブジェクトまたは配列である必要があります");
  }

  const obj = parsed as Record<string, unknown>;

  if (!Array.isArray(obj.checkItems) || obj.checkItems.length === 0) {
    throw new Error("checkItems 配列が必要です（1件以上の点検項目）");
  }

  const checkItems = obj.checkItems.map((c: unknown, i: number) => validateCheckItem(c, i));

  return {
    adName: typeof obj.adName === "string" ? obj.adName : "無題の広告",
    advertiser: typeof obj.advertiser === "string" ? obj.advertiser : undefined,
    industry: typeof obj.industry === "string" ? obj.industry : undefined,
    evaluatedAt: typeof obj.evaluatedAt === "string" ? obj.evaluatedAt : new Date().toISOString(),
    checkItems,
  };
}
