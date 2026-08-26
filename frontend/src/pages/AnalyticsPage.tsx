import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError, getAnalyticsSummary, getDashboardToday, getSourceAnalytics } from '../lib/api'
import type { AnalyticsSummary, DashboardToday, SourceAnalytics } from '../lib/types'
import { formatDate, formatMoney } from '../lib/format'
import { useToast } from '../components/Toasts'
import { IconAlertTriangle } from '../components/icons'

function daysAgoISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export function AnalyticsPage() {
  const toast = useToast()

  const [today, setToday] = useState<DashboardToday | null>(null)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [sources, setSources] = useState<SourceAnalytics[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // период по умолчанию — последние 30 дней
  const [fromDate, setFromDate] = useState(daysAgoISO(30))
  const [toDate, setToDate] = useState(daysAgoISO(0))

  const loadPeriod = useCallback(async () => {
    try {
      const [s, src] = await Promise.all([
        getAnalyticsSummary(`${fromDate}T00:00:00Z`, `${toDate}T23:59:59Z`),
        getSourceAnalytics(`${fromDate}T00:00:00Z`, `${toDate}T23:59:59Z`),
      ])
      setSummary(s)
      setSources(src)
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Не удалось загрузить аналитику')
    }
  }, [fromDate, toDate, toast])

  useEffect(() => {
    getDashboardToday()
      .then(setToday)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Не удалось загрузить дашборд'))
  }, [])

  useEffect(() => {
    void loadPeriod()
  }, [loadPeriod])

  const loading = !today && !error

  const applyPreset = (days: number) => {
    setFromDate(daysAgoISO(days))
    setToDate(daysAgoISO(0))
  }

  const bestSource = useMemo(() => {
    if (!sources || sources.length === 0) return null
    return [...sources].sort((a, b) => b.roi - a.roi)[0]
  }, [sources])

  const maxRevenue = useMemo(
    () => Math.max(1, ...(sources ?? []).map((s) => s.totalRevenue)),
    [sources],
  )

  if (loading) {
    return (
      <div className="page fade-up">
        <div className="skeleton" style={{ height: 30, width: 320, marginBottom: 24 }} />
        <div className="stat-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card stat-card">
              <div className="skeleton" style={{ height: 11, width: '55%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 26, width: '35%' }} />
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 4 }}>
          <div className="panel"><div className="skeleton" style={{ height: 220 }} /></div>
        </div>
      </div>
    )
  }

  if (error || !today) {
    return (
      <div className="page fade-up">
        <div className="card">
          <div className="empty-state">
            <div className="icon-wrap">
              <IconAlertTriangle size={24} />
            </div>
            <h3>Не удалось загрузить аналитику</h3>
            <p>{error ?? 'Попробуйте обновить страницу.'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page fade-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Аналитика</h1>
          <div className="page-subtitle">
            Сегодня: {formatMoney(today.revenueToday)} выручка · {formatMoney(today.ownerProfitToday)} прибыль ·
            данные кэшируются ~5 минут
          </div>
        </div>
      </div>

      {/* ---------- виджеты «сегодня» ---------- */}
      <div className="stat-grid">
        <div className="card stat-card">
          <span className="stat-label">Выручка сегодня</span>
          <span className="stat-value mono-num">{formatMoney(today.revenueToday)}</span>
          <span className="stat-sub">{formatDate(new Date().toISOString())}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Расходы сегодня</span>
          <span className="stat-value mono-num">{formatMoney(today.expensesToday + today.masterPayoutsToday)}</span>
          <span className="stat-sub">ремонт + выплаты мастерам</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Прибыль владельца</span>
          <span
            className="stat-value mono-num"
            style={{ color: today.ownerProfitToday >= 0 ? 'var(--green)' : 'var(--red)' }}
          >
            {formatMoney(today.ownerProfitToday)}
          </span>
          <span className="stat-sub">за сегодня</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Завершено сегодня</span>
          <span className="stat-value mono-num">{today.completedTodayCount}</span>
          <span className="stat-sub">{today.inProgressNow} в работе прямо сейчас</span>
        </div>
      </div>

      <div className="chip-row" style={{ margin: '2px 0 22px' }}>
        <span className="badge badge-assigned"><span className="dot" />Неназначенных сегодня: {today.unassignedTodayCount}</span>
        <span className="badge badge-new"><span className="dot" />С выездом на сегодня: {today.scheduledTodayCount}</span>
        <span className="badge badge-inprogress"><span className="dot" />В работе: {today.inProgressNow}</span>
      </div>

      {/* ---------- сводка за период ---------- */}
      <section className="card panel">
        <h2 className="panel-title">Сводка за период</h2>
        <div className="toolbar" style={{ marginBottom: 18 }}>
          <input type="date" className="input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} aria-label="Дата начала" />
          <span className="faint">—</span>
          <input type="date" className="input" value={toDate} onChange={(e) => setToDate(e.target.value)} aria-label="Дата конца" />
          <button className={`chip ${fromDate === daysAgoISO(7) && toDate === daysAgoISO(0) ? 'active' : ''}`} onClick={() => applyPreset(7)}>7 дней</button>
          <button className={`chip ${fromDate === daysAgoISO(30) && toDate === daysAgoISO(0) ? 'active' : ''}`} onClick={() => applyPreset(30)}>30 дней</button>
          <button className={`chip ${fromDate === daysAgoISO(90) && toDate === daysAgoISO(0) ? 'active' : ''}`} onClick={() => applyPreset(90)}>90 дней</button>
        </div>

        {summary && (
          <>
            <div className="metric-grid">
              <MetricItem label="Всего заявок" value={String(summary.totalRequests)} />
              <MetricItem label="Завершено" value={String(summary.completedCount)} />
              <MetricItem label="Конверсия" value={`${summary.conversionRate.toFixed(1)}%`} accent />
              <MetricItem label="Средний чек" value={formatMoney(summary.averageCheck)} />
              <MetricItem label="Выручка" value={formatMoney(summary.revenue)} accent />
              <MetricItem label="Реклама" value={formatMoney(summary.adExpenses)} />
              <MetricItem label="Выплаты мастерам" value={formatMoney(summary.masterPayouts)} />
              <MetricItem label="Прибыль владельца" value={formatMoney(summary.ownerProfit)} accent big />
            </div>
            {bestSource && (
              <div className="paid-banner" style={{ marginTop: 18 }}>
                Лучший источник по ROI за период: «{bestSource.sourceName}» ({bestSource.roi.toFixed(1)}%)
              </div>
            )}
          </>
        )}
      </section>

      {/* ---------- ROI по источникам ---------- */}
      <section className="card table-card" style={{ marginTop: 16 }}>
        <div className="panel" style={{ paddingBottom: 0 }}>
          <h2 className="panel-title" style={{ marginBottom: 0 }}>ROI источников · {fromDate} — {toDate}</h2>
        </div>
        <div className="table-wrap">
          <table className="requests" style={{ cursor: 'default' }}>
            <thead>
              <tr>
                <th>Источник</th>
                <th className="col-right">Заявок</th>
                <th className="col-right">Выручка</th>
                <th className="col-right">Расходы на рекламу</th>
                <th>Выручка</th>
                <th className="col-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {(sources ?? []).length === 0 ? (
                <tr style={{ cursor: 'default' }}>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <h3>Нет данных за период</h3>
                      <p>Добавьте рекламные расходы в разделе «Источники и реклама».</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sources!.map((s) => (
                  <tr key={s.sourceName}>
                    <td className="cell-main">{s.sourceName}</td>
                    <td className="amount-cell">{s.requestsCount}</td>
                    <td className="amount-cell">{formatMoney(s.totalRevenue)}</td>
                    <td className="amount-cell">{formatMoney(s.totalAdSpent)}</td>
                    <td>
                      <div className="roi-bar-track">
                        <div
                          className={`roi-bar ${s.roi < 0 ? 'neg' : ''}`}
                          style={{ width: `${Math.max(3, Math.round((s.totalRevenue / maxRevenue) * 100))}%` }}
                        />
                      </div>
                    </td>
                    <td className="amount-cell" style={{ color: s.roi >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {s.roi.toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function MetricItem({ label, value, accent, big }: { label: string; value: string; accent?: boolean; big?: boolean }) {
  return (
    <div className="info-item">
      <div className="k">{label}</div>
      <div
        className="v mono-num"
        style={{
          fontSize: big ? 22 : undefined,
          fontWeight: big ? 800 : undefined,
          ...(accent
            ? { color: big ? 'var(--green)' : 'var(--text)' }
            : {}),
        }}
      >
        {value}
      </div>
    </div>
  )
}
