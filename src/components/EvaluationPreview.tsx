import { useState } from 'react';
import type { AdEvaluation, Verdict } from '../types/evaluation.ts';
import { VERDICT_COLORS } from '../types/evaluation.ts';

type VerdictFilter = Verdict | 'ALL';

type Props = {
  data: AdEvaluation;
};

const ALL_VERDICTS: Verdict[] = ['OK', 'NG', '該当なし', '確認不可', '判定不可'];

function verdictCssClass(verdict: Verdict): string {
  switch (verdict) {
    case 'OK': return 'ok';
    case 'NG': return 'ng';
    case '該当なし': return 'na';
    case '確認不可': return 'unknown';
    case '判定不可': return 'unknown';
  }
}

function DonutChart({ counts, total, onFilter }: { counts: Record<Verdict, number>; total: number; onFilter: (v: VerdictFilter) => void }) {
  const [hovered, setHovered] = useState<Verdict | null>(null);

  const size = 100;
  const strokeWidth = 14;
  const hoverStrokeWidth = 18;
  const radius = (size - hoverStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = ALL_VERDICTS
    .map((verdict) => ({ verdict, count: counts[verdict] }))
    .filter((s) => s.count > 0);

  let offset = 0;
  const okRate = total > 0 ? Math.round((counts.OK / total) * 100) : 0;

  const hoveredRate = hovered && total > 0
    ? Math.round((counts[hovered] / total) * 100)
    : null;

  return (
    <div className="donut-chart">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}
        />
        {segments.map((seg) => {
          const dashLength = (seg.count / total) * circumference;
          const dashOffset = -offset;
          offset += dashLength;
          const isHovered = hovered === seg.verdict;
          return (
            <circle
              key={seg.verdict}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={VERDICT_COLORS[seg.verdict]}
              strokeWidth={isHovered ? hoverStrokeWidth : strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              opacity={hovered && !isHovered ? 0.3 : 1}
              style={{ transition: 'stroke-width 0.2s, opacity 0.2s', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(seg.verdict)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onFilter(seg.verdict)}
            />
          );
        })}
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fill={hovered ? VERDICT_COLORS[hovered] : '#e0e0f0'} fontSize="20" fontWeight="700" style={{ transition: 'fill 0.2s' }}>
          {hoveredRate ?? okRate}%
        </text>
        <text x={size / 2} y={size / 2 + 12} textAnchor="middle" fill="#888" fontSize="9">
          {hovered ?? 'OK率'}
        </text>
      </svg>
      <div
        className={`donut-tooltip${hovered ? ' donut-tooltip--visible' : ''}`}
        style={{ borderColor: hovered ? VERDICT_COLORS[hovered] : 'transparent' }}
      >
        {hovered && (
          <>
            <span style={{ color: VERDICT_COLORS[hovered], fontWeight: 700 }}>{hovered}</span>
            <span>{counts[hovered]}件 / {total}件 ({hoveredRate}%)</span>
          </>
        )}
      </div>
    </div>
  );
}

export function EvaluationPreview({ data }: Props) {
  const [filter, setFilter] = useState<VerdictFilter>('ALL');

  const evalDate = new Date(data.evaluatedAt);
  const dateStr = isNaN(evalDate.getTime())
    ? data.evaluatedAt
    : evalDate.toLocaleString('ja-JP');

  const total = data.checkItems.length;
  const counts: Record<Verdict, number> = { OK: 0, NG: 0, "該当なし": 0, "確認不可": 0, "判定不可": 0 };
  for (const item of data.checkItems) {
    counts[item.verdict]++;
  }

  // Only show verdict types that have items
  const activeVerdicts = ALL_VERDICTS.filter((v) => counts[v] > 0);

  const filtered = filter === 'ALL'
    ? data.checkItems
    : data.checkItems.filter((item) => item.verdict === filter);

  // Group by category
  const categories: { name: string; items: typeof data.checkItems }[] = [];
  for (const item of filtered) {
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
        <DonutChart counts={counts} total={total} onFilter={setFilter} />
        <div className="summary-counts">
          {activeVerdicts.map((v) => (
            <div
              key={v}
              className={`summary-item summary-item--clickable${filter === v ? ' summary-item--active' : ''}`}
              onClick={() => setFilter(filter === v ? 'ALL' : v)}
            >
              <span className="summary-count" style={{ color: VERDICT_COLORS[v] }}>{counts[v]}</span>
              <span className="summary-label">{v}</span>
            </div>
          ))}
          <div
            className={`summary-item summary-item--clickable${filter === 'ALL' ? ' summary-item--active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            <span className="summary-count">{total}</span>
            <span className="summary-label">全項目</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn${filter === 'ALL' ? ' filter-btn--active' : ''}`}
          style={{ '--filter-color': '#c0c0d0', borderColor: filter === 'ALL' ? '#c0c0d0' : undefined } as React.CSSProperties}
          onClick={() => setFilter('ALL')}
        >
          すべて
          <span className="filter-btn__count">{total}</span>
        </button>
        {activeVerdicts.map((v) => {
          const color = VERDICT_COLORS[v];
          return (
            <button
              key={v}
              className={`filter-btn${filter === v ? ' filter-btn--active' : ''}`}
              style={{
                '--filter-color': color,
                borderColor: filter === v ? color : undefined,
              } as React.CSSProperties}
              onClick={() => setFilter(v)}
            >
              {v}
              <span className="filter-btn__count">{counts[v]}</span>
            </button>
          );
        })}
      </div>

      <div className="check-list">
        {categories.map((cat) => (
          <div key={cat.name} className="check-category">
            <h3 className="category-title">{cat.name}</h3>
            {cat.items.map((item) => (
              <div key={item.id} className={`check-item check-item--${verdictCssClass(item.verdict)}`}>
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
                {(item.extractedText || item.reason || item.improvement) && (
                  <div className="check-item__details">
                    {item.extractedText && (
                      <div className="detail-row">
                        <span className="detail-label detail-label--extracted">抽出テキスト</span>
                        <span className="detail-text detail-text--extracted">{item.extractedText}</span>
                      </div>
                    )}
                    {item.reason && (
                      <div className="detail-row">
                        <span className={`detail-label detail-label--${item.verdict === "OK" ? "ok-reason" : "reason"}`}>
                          備考
                        </span>
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
