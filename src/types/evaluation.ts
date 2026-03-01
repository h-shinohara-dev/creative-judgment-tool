export type Verdict = "OK" | "NG" | "判定不可";

export type CheckItem = {
  id: number;
  category: string;
  item: string;
  verdict: Verdict;
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
  "判定不可": "#facc15",
};
