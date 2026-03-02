export type Verdict = "OK" | "NG" | "該当なし" | "確認不可" | "判定不可";

export type CheckItem = {
  id: number;
  category: string;
  item: string;
  verdict: Verdict;
  extractedText: string | null;
  reason: string | null;
  improvement: string | null;
};

export type AdEvaluation = {
  adName: string;
  advertiser?: string;
  industry?: string;
  evaluatedAt: string;
  checkItems: CheckItem[];
};

export const VERDICT_COLORS: Record<Verdict, string> = {
  OK: "#4ade80",
  NG: "#f87171",
  "該当なし": "#94a3b8",
  "確認不可": "#facc15",
  "判定不可": "#facc15",
};
