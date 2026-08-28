import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, getAnalyticsSummary, getDashboardToday, getSourceAnalytics } from '../lib/api'
import type { AnalyticsSummary, DashboardToday, SourceAnalytics } from '../lib/types'
import { formatMoney } from '../lib/format'
import { useToast } from '../components/Toasts'
import {
  IconAlertTriangle,
  IconCalendar,
  IconDownload,
  IconPieChart,
} from '../components/icons'
import { FinancialDonutChart } from '../components/AnalyticsCharts'

function daysAgoISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function startOfCurrentMonthISO(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

export function AnalyticsPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [today, setToday] = useState<DashboardToday | null>(null)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [sources, setSources] = useState<SourceAnalytics[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // период по умолчанию — с начала текущего месяца
  const [fromDate, setFromDate] = useState(startOfCurrentMonthISO())
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

  const applyPreset = (preset: '7d' | '30d' | '90d' | 'month') => {
    if (preset === '7d') {
      setFromDate(daysAgoISO(7))
      setToDate(daysAgoISO(0))
    } else if (preset === '30d') {
      setFromDate(daysAgoISO(30))
      setToDate(daysAgoISO(0))
    } else if (preset === '90d') {
      setFromDate(daysAgoISO(90))
      setToDate(daysAgoISO(0))
    } else if (preset === 'month') {
      setFromDate(startOfCurrentMonthISO())
      setToDate(daysAgoISO(0))
    }
  }

  const exportReportCSV = () => {
    if (!summary) return
    const rows = [
      ['Отчёт по аналитике сервисного центра', `${fromDate} - ${toDate}`],
      [''],
      ['Метрика', 'Значение'],
      ['Всего заявок', summary.totalRequests],
      ['Завершено ремонтов', summary.completedCount],
      ['Конверсия', `${summary.conversionRate.toFixed(1)}%`],
      ['Средний чек', `${summary.averageCheck} ₽`],
      ['Общая выручка', `${summary.revenue} ₽`],
      ['Выплаты мастерам', `${summary.masterPayouts} ₽`],
      ['Запчасти и прямые расходы', `${summary.directExpenses} ₽`],
      ['Рекламные расходы', `${summary.adExpenses} ₽`],
      ['Чистая прибыль владельца', `${summary.ownerProfit} ₽`],
      [''],
      ['Канал рекламы', 'Заявок', 'Выручка', 'Расходы', 'ROI %'],
      ...(sources ?? []).map((s) => [s.sourceName, s.requestsCount, s.totalRevenue, s.totalAdSpent, `${s.roi.toFixed(1)}%`]),
    ]

    const csvContent = '\uFEFF' + rows.map((r) => r.map((c) => `"${c}"`).join(';')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics_report_${fromDate}_${toDate}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast('success', 'Отчёт в формате CSV успешно скачан')
  }

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
        <div className="card" style={{ marginTop: 16 }}>
          <div className="panel"><div className="skeleton" style={{ height: 260 }} /></div>
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
          <h1 className="page-title">Аналитика и отчёты</h1>
        </div>
        <button className="btn btn-ghost" onClick={exportReportCSV} title="Выгрузить отчёт в Excel / CSV">
          <IconDownload size={15} />
          Экспорт отчёта
        </button>
      </div>

      {/* ---------- виджеты «сегодня» ---------- */}
      <div className="stat-grid">
        <div className="card stat-card">
          <span className="stat-label">Выручка сегодня</span>
          <span className="stat-value mono-num">{formatMoney(today.revenueToday)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Расходы сегодня</span>
          <span className="stat-value mono-num">{formatMoney(today.expensesToday + today.masterPayoutsToday)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Прибыль владельца</span>
          <span
            className="stat-value mono-num"
            style={{ color: today.ownerProfitToday >= 0 ? '#10b981' : '#ef4444' }}
          >
            {formatMoney(today.ownerProfitToday)}
          </span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Завершено сегодня</span>
          <span className="stat-value mono-num">{today.completedTodayCount}</span>
        </div>
      </div>

      <div className="chip-row" style={{ margin: '2px 0 22px' }}>
        <span className="badge badge-assigned"><span className="dot" />Неназначенных сегодня: {today.unassignedTodayCount}</span>
        <span className="badge badge-new"><span className="dot" />С выездом на сегодня: {today.scheduledTodayCount}</span>
        <span className="badge badge-inprogress"><span className="dot" />В процессе ремонта: {today.inProgressNow}</span>
      </div>

      {/* ---------- сводка за период ---------- */}
      <section className="card panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <h2 className="panel-title" style={{ margin: 0 }}>
            <IconCalendar size={16} />
            Сводные KPI за период
          </h2>
          <div className="toolbar" style={{ margin: 0 }}>
            <input
              type="date"
              className="input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              aria-label="Дата начала"
            />
            <span className="faint">—</span>
            <input
              type="date"
              className="input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              aria-label="Дата конца"
            />
            <button
              className={`chip ${fromDate === startOfCurrentMonthISO() && toDate === daysAgoISO(0) ? 'active' : ''}`}
              onClick={() => applyPreset('month')}
            >
              Этот месяц
            </button>
            <button
              className={`chip ${fromDate === daysAgoISO(7) && toDate === daysAgoISO(0) ? 'active' : ''}`}
              onClick={() => applyPreset('7d')}
            >
              7 дней
            </button>
            <button
              className={`chip ${fromDate === daysAgoISO(30) && toDate === daysAgoISO(0) ? 'active' : ''}`}
              onClick={() => applyPreset('30d')}
            >
              30 дней
            </button>
            <button
              className={`chip ${fromDate === daysAgoISO(90) && toDate === daysAgoISO(0) ? 'active' : ''}`}
              onClick={() => applyPreset('90d')}
            >
              90 дней
            </button>
          </div>
        </div>

        {summary && (
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
        )}
      </section>

      {/* ---------- Структура выручки и расходов (Donut) ---------- */}
      {summary && (
        <section className="card panel" style={{ marginTop: 20 }}>
          <h2 className="panel-title">
            <IconPieChart size={16} />
            Структура выручки и расходов
          </h2>
          <FinancialDonutChart summary={summary} />
        </section>
      )}

      {/* ---------- Детальная таблица по источникам и ROI ---------- */}
      {sources && sources.length > 0 && (
        <section className="card table-card" style={{ marginTop: 20 }}>
          <div className="panel" style={{ paddingBottom: 0 }}>
            <h2 className="panel-title" style={{ marginBottom: 0 }}>Источники</h2>
          </div>
          <div className="table-wrap">
            <table className="requests">
              <thead>
                <tr>
                  <th>Источник</th>
                  <th className="col-right">Заявок</th>
                  <th className="col-right">Выручка</th>
                  <th className="col-right">Расходы на рекламу</th>
                  <th>Доля в выручке</th>
                  <th className="col-right">ROI</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr
                    key={s.sourceName}
                    onClick={() => navigate(`/lead-sources?name=${encodeURIComponent(s.sourceName)}`)}
                    style={{ cursor: 'pointer' }}
                    title={`Открыть источник «${s.sourceName}»`}
                  >
                    <td className="cell-main" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      {s.sourceName}
                    </td>
                    <td className="amount-cell">{s.requestsCount}</td>
                    <td className="amount-cell">{formatMoney(s.totalRevenue)}</td>
                    <td className="amount-cell">{formatMoney(s.totalAdSpent)}</td>
                    <td>
                      <div className="roi-bar-track">
                        <div
                          className={`roi-bar ${s.roi < 0 ? 'neg' : ''}`}
                          style={{ width: `${Math.max(4, Math.round((s.totalRevenue / maxRevenue) * 100))}%` }}
                        />
                      </div>
                    </td>
                    <td className="amount-cell" style={{ color: s.roi >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                      {s.roi >= 0 ? `+${s.roi.toFixed(1)}%` : `${s.roi.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
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
            ? { color: big ? '#10b981' : 'var(--text)' }
            : {}),
        }}
      >
        {value}
      </div>
    </div>
  )
}

