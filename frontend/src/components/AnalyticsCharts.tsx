import { useState } from 'react'
import type { AnalyticsSummary, SourceAnalytics } from '../lib/types'
import { formatMoney } from '../lib/format'

/* ================= 1. Кольцевая диаграмма структуры выручки ================= */

interface DonutSegment {
  key: string
  label: string
  value: number
  chartValue: number
  color: string
  share: number
}

export function FinancialDonutChart({ summary }: { summary: AnalyticsSummary }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const isProfitPositive = summary.ownerProfit >= 0

  const rawSegments = [
    {
      key: 'revenue',
      label: 'Выручка',
      value: summary.revenue,
      chartValue: summary.revenue,
      color: '#10b981',
    },
    {
      key: 'masters',
      label: 'Выплаты мастерам',
      value: summary.masterPayouts,
      chartValue: summary.masterPayouts,
      color: '#6366f1',
    },
    {
      key: 'direct',
      label: 'Запчасти и материалы',
      value: summary.directExpenses,
      chartValue: summary.directExpenses,
      color: '#f59e0b',
    },
    {
      key: 'ads',
      label: 'Расходы на рекламу',
      value: summary.adExpenses,
      chartValue: summary.adExpenses,
      color: '#ec4899',
    },
  ]

  const chartSum = rawSegments.reduce((acc, s) => acc + s.chartValue, 0) || 1
  const segments: DonutSegment[] = rawSegments.map((s) => ({
    ...s,
    share: s.chartValue > 0 ? Math.round((s.chartValue / chartSum) * 100) : 0,
  }))

  const radius = 90
  const strokeWidth = 24
  const circumference = 2 * Math.PI * radius

  let accumulatedPercent = 0

  const activeSegment = hoveredKey ? segments.find((s) => s.key === hoveredKey) : null

  return (
    <div className="chart-donut-wrap">
      <div className="donut-svg-container">
        <svg viewBox="0 0 240 240" className="donut-svg">
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg) => {
            if (seg.share <= 0) return null
            const strokeDasharray = `${(seg.share / 100) * circumference} ${circumference}`
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference)
            accumulatedPercent += seg.share

            const isHovered = hoveredKey === seg.key
            return (
              <circle
                key={seg.key}
                cx="120"
                cy="120"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 120 120)"
                style={{
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                  cursor: 'pointer',
                  opacity: hoveredKey && !isHovered ? 0.4 : 1,
                }}
                onMouseEnter={() => setHoveredKey(seg.key)}
                onMouseLeave={() => setHoveredKey(null)}
              />
            )
          })}
        </svg>

        <div className="donut-center-label">
          <div className="center-caption">
            {activeSegment ? activeSegment.label : 'Прибыль владельца'}
          </div>
          <div
            className="center-value mono-num"
            style={{
              color: activeSegment
                ? undefined
                : isProfitPositive
                  ? '#10b981'
                  : '#ef4444',
            }}
          >
            {activeSegment ? formatMoney(activeSegment.value) : formatMoney(summary.ownerProfit)}
          </div>
        </div>
      </div>

      <div className="donut-legend">
        {segments.map((s) => (
          <div
            key={s.key}
            className={`legend-item ${hoveredKey === s.key ? 'active' : ''}`}
            onMouseEnter={() => setHoveredKey(s.key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className="legend-left">
              <span className="legend-dot" style={{ background: s.color }} />
              <span className="legend-name">{s.label}</span>
            </div>
            <div className="legend-right">
              <span className="legend-amount mono-num">{formatMoney(s.value)}</span>
              <span className="legend-pct mono-num">{s.share}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================= 2. Воронка конверсии заявок ================= */

export function ConversionFunnelChart({ summary }: { summary: AnalyticsSummary }) {
  const total = Math.max(1, summary.totalRequests)
  const completed = summary.completedCount
  const cancelled = Math.max(0, summary.totalRequests - completed)

  const steps = [
    {
      title: '1. Поступило заявок',
      count: summary.totalRequests,
      sub: '100% входящий поток',
      pct: 100,
      color: 'linear-gradient(135deg, #6366f1, #818cf8)',
    },
    {
      title: '2. Выполнено ремонтов',
      count: completed,
      sub: `Конверсия: ${summary.conversionRate.toFixed(1)}%`,
      pct: Math.min(100, Math.round((completed / total) * 100)),
      color: 'linear-gradient(135deg, #10b981, #34d399)',
    },
    {
      title: '3. Оплачено клиентами',
      count: completed,
      sub: `${formatMoney(summary.revenue)} выручки`,
      pct: Math.min(100, Math.round((completed / total) * 100)),
      color: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    },
  ]

  return (
    <div className="funnel-container">
      <div className="funnel-steps">
        {steps.map((step, idx) => (
          <div key={step.title} className="funnel-step">
            <div className="funnel-step-head">
              <div className="funnel-step-title">{step.title}</div>
              <div className="funnel-step-count mono-num">{step.count}</div>
            </div>

            <div className="funnel-bar-track">
              <div
                className="funnel-bar-fill"
                style={{
                  width: `${Math.max(6, step.pct)}%`,
                  background: step.color,
                }}
              />
            </div>

            <div className="funnel-step-footer">
              <span className="funnel-sub">{step.sub}</span>
              <span className="funnel-pct mono-num">{step.pct}%</span>
            </div>

            {idx < steps.length - 1 && (
              <div className="funnel-connector">
                <span className="conn-line" />
                <span className="conn-arrow">↓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="funnel-stats-card">
        <div className="f-stat-item">
          <div className="f-k">Конверсия в оплату</div>
          <div className="f-v mono-num" style={{ color: '#10b981' }}>
            {summary.conversionRate.toFixed(1)}%
          </div>
        </div>
        <div className="f-stat-item">
          <div className="f-k">Отвал / не завершено</div>
          <div className="f-v mono-num" style={{ color: 'var(--text-faint)' }}>
            {cancelled} заявок ({total > 0 ? ((cancelled / total) * 100).toFixed(1) : 0}%)
          </div>
        </div>
        <div className="f-stat-item">
          <div className="f-k">Средний чек с заказа</div>
          <div className="f-v mono-num">{formatMoney(summary.averageCheck)}</div>
        </div>
      </div>
    </div>
  )
}

/* ================= 3. Сравнение источников рекламы (Bar Chart & ROI) ================= */

export function SourceRoiComparisonChart({ sources }: { sources: SourceAnalytics[] }) {
  if (sources.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '24px 10px' }}>
        <h3>Нет данных по источникам за выбранный период</h3>
        <p>Внесите расходы в разделе «Источники и реклама».</p>
      </div>
    )
  }

  const maxRevenue = Math.max(1, ...sources.map((s) => s.totalRevenue))
  const bestSource = [...sources].sort((a, b) => b.roi - a.roi)[0]

  return (
    <div className="sources-chart-wrap">
      {bestSource && bestSource.roi > 0 && (
        <div className="best-source-banner">
          <div className="bs-badge">Лидер по окупаемости</div>
          <div className="bs-content">
            Канал <strong>«{bestSource.sourceName}»</strong> показал рекордный ROI{' '}
            <span className="mono-num" style={{ color: '#10b981', fontWeight: 700 }}>
              +{bestSource.roi.toFixed(1)}%
            </span>{' '}
            (выручка {formatMoney(bestSource.totalRevenue)} при рекламе {formatMoney(bestSource.totalAdSpent)}).
          </div>
        </div>
      )}

      <div className="sources-bars-list">
        {sources.map((src) => {
          const revPercent = Math.max(4, Math.round((src.totalRevenue / maxRevenue) * 100))
          const isProfitable = src.roi >= 0
          return (
            <div key={src.sourceName} className="source-bar-card">
              <div className="sb-header">
                <div className="sb-name">
                  <span>{src.sourceName}</span>
                  <span className="sb-count mono-num">{src.requestsCount} заявок</span>
                </div>
                <div className="sb-values mono-num">
                  <span className="sb-rev">{formatMoney(src.totalRevenue)}</span>
                  <span className={`sb-roi ${isProfitable ? 'pos' : 'neg'}`}>
                    {src.roi >= 0 ? `+${src.roi.toFixed(1)}%` : `${src.roi.toFixed(1)}%`} ROI
                  </span>
                </div>
              </div>

              <div className="sb-track">
                <div
                  className="sb-fill"
                  style={{
                    width: `${revPercent}%`,
                    background: isProfitable
                      ? 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)'
                      : 'linear-gradient(90deg, #6366f1 0%, #ef4444 100%)',
                  }}
                />
              </div>

              <div className="sb-footer">
                <span className="faint">Расходы на рекламу:</span>
                <span className="mono-num">{formatMoney(src.totalAdSpent)}</span>
                <span className="faint" style={{ margin: '0 4px' }}>·</span>
                <span className="faint">Чистая прибыль канала:</span>
                <span
                  className="mono-num"
                  style={{ color: src.totalRevenue - src.totalAdSpent >= 0 ? '#10b981' : '#ef4444' }}
                >
                  {formatMoney(src.totalRevenue - src.totalAdSpent)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ================= 4. Юнит-экономика и метрики эффективности ================= */

export function UnitEconomicsCard({ summary }: { summary: AnalyticsSummary }) {
  const requests = Math.max(1, summary.totalRequests)
  const completed = Math.max(1, summary.completedCount)
  const revenue = Math.max(1, summary.revenue)

  const cpa = Math.round(summary.adExpenses / requests)
  const profitPerJob = Math.round(summary.ownerProfit / completed)
  const grossMargin = ((summary.ownerProfit / revenue) * 100).toFixed(1)
  const drr = ((summary.adExpenses / revenue) * 100).toFixed(1)

  return (
    <div className="unit-grid">
      <div className="unit-card">
        <div className="unit-label">Маржинальность бизнеса</div>
        <div className="unit-val mono-num" style={{ color: Number(grossMargin) >= 0 ? '#10b981' : '#ef4444' }}>
          {grossMargin}%
        </div>
        <div className="unit-sub">Доля чистой прибыли в выручке</div>
      </div>

      <div className="unit-card">
        <div className="unit-label">Стоимость заявки (CPA)</div>
        <div className="unit-val mono-num">{formatMoney(cpa)}</div>
        <div className="unit-sub">Рекламный бюджет на 1 входящую заявку</div>
      </div>

      <div className="unit-card">
        <div className="unit-label">Прибыль с 1 заказа</div>
        <div className="unit-val mono-num" style={{ color: profitPerJob >= 0 ? '#10b981' : '#ef4444' }}>
          {formatMoney(profitPerJob)}
        </div>
        <div className="unit-sub">Чистый доход владельца с выполненного ремонта</div>
      </div>

      <div className="unit-card">
        <div className="unit-label">Доля рекламы (ДРР)</div>
        <div className="unit-val mono-num">{drr}%</div>
        <div className="unit-sub">Процент выручки, уходящий на привлечение</div>
      </div>
    </div>
  )
}

/* ================= 5. Радиальный круговой индикатор ================= */

export function RadialGauge({
  value,
  max = 100,
  label,
  color = '#10b981',
}: {
  value: number
  max?: number
  label: string
  color?: string
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))
  const radius = 38
  const stroke = 8
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div className="radial-gauge">
      <div className="gauge-svg-wrap">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle
            cx="45"
            cy="45"
            r={radius}
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth={stroke}
          />
          <circle
            cx="45"
            cy="45"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 45 45)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="gauge-center-text mono-num">{percent.toFixed(0)}%</div>
      </div>
      <div className="gauge-label">{label}</div>
    </div>
  )
}
