import type { AdEvaluation, Verdict } from '../types/evaluation.ts';
import { VERDICT_COLORS } from '../types/evaluation.ts';

type Props = {
  data: AdEvaluation;
};

export function EvaluationPreview({ data }: Props) {
  const evalDate = new Date(data.evaluatedAt);
  const dateStr = isNaN(evalDate.getTime())
    ? data.evaluatedAt
    : evalDate.toLocaleString('ja-JP');

  const total = data.checkItems.length;
  const counts: Record<Verdict, number> = { OK: 0, NG: 0, "判定不可": 0 };
  for (const item of data.checkItems) {
    counts[item.verdict]++;
  }

  // Group by category
  const categories: { name: string; items: typeof data.checkItems }[] = [];
  for (const item of data.checkItems) {
    const existing = categories.find((c) => c.name === item.category);
    if (existing) {
      existing.items.push(item);
    } else {
      categories.push({ name: item.category, items: [item] });
    }
  }

  return (
    <div className="evaluation-preview">
      <div className="preview-header">
        <h2>{data.adName}</h2>
        <div className="preview-meta">
          {data.advertiser && <span className="tag">{data.advertiser}</span>}
          {data.industry && <span className="tag">{data.industry}</span>}
          <span className="preview-date">{dateStr}</span>
        </div>
      </div>

      <div className="summary-bar">
        <div className="summary-item">
          <span className="summary-count" style={{ color: VERDICT_COLORS.OK }}>{counts.OK}</span>
          <span className="summary-label">OK</span>
        </div>
        <div className="summary-item">
          <span className="summary-count" style={{ color: VERDICT_COLORS.NG }}>{counts.NG}</span>
          <span className="summary-label">NG</span>
        </div>
        <div className="summary-item">
          <span className="summary-count" style={{ color: VERDICT_COLORS["判定不可"] }}>{counts["判定不可"]}</span>
          <span className="summary-label">判定不可</span>
        </div>
        <div className="summary-item">
          <span className="summary-count">{total}</span>
          <span className="summary-label">全項目</span>
        </div>
      </div>

      <div className="check-list">
        {categories.map((cat) => (
          <div key={cat.name} className="check-category">
            <h3 className="category-title">{cat.name}</h3>
            {cat.items.map((item) => (
              <div key={item.id} className={`check-item check-item--${item.verdict === "OK" ? "ok" : item.verdict === "NG" ? "ng" : "unknown"}`}>
                <div className="check-item__header">
                  <span className="check-item__id">{item.id}</span>
                  <span className="check-item__name">{item.item}</span>
                  <span
                    className="verdict-badge"
                    style={{ borderColor: VERDICT_COLORS[item.verdict], color: VERDICT_COLORS[item.verdict] }}
                  >
                    {item.verdict}
                  </span>
                </div>
                {(item.reason || item.improvement) && (
                  <div className="check-item__details">
                    {item.reason && (
                      <div className="detail-row">
                        <span className={`detail-label detail-label--${item.verdict === "OK" ? "ok-reason" : "reason"}`}>理由</span>
                        <span className="detail-text">{item.reason}</span>
                      </div>
                    )}
                    {item.improvement && (
                      <div className="detail-row">
                        <span className="detail-label detail-label--improvement">改善案</span>
                        <span className="detail-text">{item.improvement}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
