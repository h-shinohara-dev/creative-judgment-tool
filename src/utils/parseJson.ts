import type { AdEvaluation, CheckItem, Verdict } from '../types/evaluation.ts';

const VALID_VERDICTS: Verdict[] = ["OK", "NG", "判定不可"];

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
    reason: typeof obj.reason === "string" && obj.reason ? obj.reason : null,
    improvement: typeof obj.improvement === "string" && obj.improvement ? obj.improvement : null,
  };
}

export function parseEvaluationJson(raw: string): AdEvaluation {
  if (!raw.trim()) {
    throw new Error("JSONを入力してください");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("JSONの形式が正しくありません。構文を確認してください");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("JSONはオブジェクトである必要があります");
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
