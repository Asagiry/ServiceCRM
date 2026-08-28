import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, createRequest, getDashboardToday, getRequests } from '../lib/api'
import type { DashboardToday, ServiceRequest } from '../lib/types'
import { formatMoney } from '../lib/format'
import { StatusBadge } from '../components/StatusBadge'
import { CreateRequestModal } from '../components/CreateRequestModal'
import { useToast } from '../components/Toasts'
import {
  IconAlertTriangle,
  IconClipboardList,
  IconPlus,
} from '../components/icons'

export function DashboardPage() {
  const toast = useToast()

  const [today, setToday] = useState<DashboardToday | null>(null)
  const [recent, setRecent] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10)
      const [d, reqs] = await Promise.all([
        getDashboardToday(),
        getRequests({ dateTime: todayStr, page: 1, pageSize: 8 }),
      ])
      setToday(d)
      setRecent(reqs.items)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось загрузить дашборд')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <div className="page fade-up">
        <div className="skeleton" style={{ height: 30, width: 220, marginBottom: 24 }} />
        <div className="stat-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card stat-card">
              <div className="skeleton" style={{ height: 11, width: '55%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 26, width: '35%' }} />
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 4 }}>
          <div className="panel">
            <div className="skeleton" style={{ height: 150 }} />
          </div>
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
            <h3>Не удалось загрузить дашборд</h3>
            <p>{error}</p>
            <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => void load()}>
              Повторить
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page fade-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Главная</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <IconPlus size={16} />
          Новая заявка
        </button>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <span className="stat-label">Неназначенные</span>
          <span className="stat-value mono-num">{today.unassignedTodayCount}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Выезды сегодня</span>
          <span className="stat-value mono-num">{today.scheduledTodayCount}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">В работе сейчас</span>
          <span className="stat-value mono-num">{today.inProgressNow}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Выручка сегодня</span>
          <span className="stat-value mono-num">{formatMoney(today.revenueToday)}</span>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="card stat-card">
          <span className="stat-label">Расходы сегодня</span>
          <span className="stat-value mono-num">{formatMoney(today.expensesToday + today.masterPayoutsToday)}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Чистая прибыль владельца</span>
          <span className="stat-value mono-num" style={{ color: today.ownerProfitToday >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {formatMoney(today.ownerProfitToday)}
          </span>
        </div>
      </div>

      <div className="card">
        <div className="panel" style={{ paddingBottom: 12 }}>
          <div className="section-card-title">Заявки на сегодня</div>
        </div>

        {recent.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px 44px' }}>
            <div className="icon-wrap">
              <IconClipboardList size={24} />
            </div>
            <h3>Сегодня заявок пока нет</h3>
            <p>Нажмите «Новая заявка», чтобы создать первую.</p>
          </div>
        ) : (
          recent.map((r) => (
            <Link key={r.id} to={`/requests/${r.id}`} className="today-row" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="tr-main">
                <div className="tr-title">
                  {r.clientFullName}
                </div>
                <div className="tr-sub">
                  {r.equipmentType} · {r.city}{r.masterFullName ? ` · мастер: ${r.masterFullName}` : ' · мастер не назначен'}
                </div>
              </div>
              <div className="tr-right">
                <StatusBadge status={r.status} />
                <span className="tr-amount">{r.totalPrice ? formatMoney(r.totalPrice) : '—'}</span>
              </div>
            </Link>
          ))
        )}

        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 18px', textAlign: 'center' }}>
          <Link to="/requests" style={{ fontWeight: 600, fontSize: 13.5, textDecoration: 'none', color: 'var(--text-dim)' }}>
            Все заявки →
          </Link>
        </div>
      </div>

      {showCreate && (
        <CreateRequestModal
          busy={creating}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            toast('success', 'Заявка создана')
            setLoading(true)
            void load()
          }}
          onSubmit={(dto) => {
            setCreating(true)
            return createRequest(dto).finally(() => setCreating(false))
          }}
        />
      )}
    </div>
  )
}
