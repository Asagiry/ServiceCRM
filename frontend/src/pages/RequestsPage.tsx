import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, createRequest, getActiveMasters, getRequests } from '../lib/api'
import type { Master, RequestStatus, ServiceRequest } from '../lib/types'
import { STATUS_LABELS } from '../lib/types'
import { formatDateTime, formatMoney } from '../lib/format'
import { StatusBadge } from '../components/StatusBadge'
import { Pagination } from '../components/Pagination'
import { CreateRequestModal } from '../components/CreateRequestModal'
import { useToast } from '../components/Toasts'
import { IconClipboardList, IconInbox, IconPlus } from '../components/icons'

const STATUS_TABS: (RequestStatus | 'All')[] = ['All', 'New', 'Assigned', 'InProgress', 'Completed', 'Cancelled']

export function RequestsPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [items, setItems] = useState<ServiceRequest[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [status, setStatus] = useState<RequestStatus | 'All'>('All')
  const [masterId, setMasterId] = useState('')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [masters, setMasters] = useState<Master[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    getActiveMasters()
      .then(setMasters)
      .catch(() => {}) // фильтр по мастеру не критичен
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getRequests({
        status: status === 'All' ? undefined : status,
        masterId: masterId ? Number(masterId) : undefined,
        dateTime: date || undefined,
        page,
        pageSize,
      })
      setItems(res.items)
      setTotalCount(res.totalCount)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Не удалось загрузить заявки')
    } finally {
      setLoading(false)
    }
  }, [status, masterId, date, page, pageSize])

  useEffect(() => {
    void load()
  }, [load])

  /** Смена фильтра всегда сбрасывает пагинацию на первую страницу. */
  const changeStatus = (s: RequestStatus | 'All') => {
    setStatus(s)
    setPage(1)
  }
  const changeMaster = (v: string) => {
    setMasterId(v)
    setPage(1)
  }
  const changeDate = (v: string) => {
    setDate(v)
    setPage(1)
  }

  const isEmpty = !loading && !error && items.length === 0
  const activeFilters = useMemo(
    () => ({ status, masterId, date }),
    [status, masterId, date],
  )

  return (
    <div className="page fade-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Заявки</h1>
          <div className="page-subtitle">
            {loading ? 'Загрузка…' : `Всего заявок: ${totalCount}`}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <IconPlus size={16} />
          Новая заявка
        </button>
      </div>

      <div className="toolbar">
        <div className="chip-row" role="tablist" aria-label="Фильтр по статусу">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={status === s}
              className={`chip ${status === s ? 'active' : ''}`}
              onClick={() => changeStatus(s)}
            >
              {s === 'All' ? 'Все' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="toolbar-spacer" />

        <select
          className="select"
          value={masterId}
          onChange={(e) => changeMaster(e.target.value)}
          aria-label="Фильтр по мастеру"
        >
          <option value="">Все мастера</option>
          {masters.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullname}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="input"
          value={date}
          onChange={(e) => changeDate(e.target.value)}
          aria-label="Дата создания"
        />
      </div>

      <div className="card table-card">
        <div className="table-wrap only-desktop">
          <table className="requests">
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Техника</th>
                <th>Город / адрес</th>
                <th>Мастер</th>
                <th>Создана</th>
                <th className="col-right">Сумма</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: Math.min(pageSize, 8) }, (_, i) => (
                  <tr key={`sk-${i}`}>
                    {Array.from({ length: 7 }, (_, j) => (
                      <td key={j}>
                        <div
                          className="skeleton"
                          style={{ height: 14, width: `${45 + ((i * 13 + j * 29) % 50)}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading &&
                items.map((r) => (
                  <tr key={r.id} onClick={() => navigate(`/requests/${r.id}`)} tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/requests/${r.id}`)}>
                    <td>
                      <div className="cell-main">{r.clientFullName}</div>
                      <div className="cell-sub mono-num">{r.clientPhoneNumber}</div>
                    </td>
                    <td>{r.equipmentType}</td>
                    <td>
                      <div className="cell-main" style={{ fontWeight: 500 }}>{r.city}</div>
                      <div className="cell-sub">{r.address}</div>
                    </td>
                    <td>{r.masterFullName ?? <span className="faint">—</span>}</td>
                    <td className="mono-num" style={{ whiteSpace: 'nowrap', color: 'var(--text-dim)' }}>
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="amount-cell">
                      {r.totalPrice ? formatMoney(r.totalPrice) : <span className="faint">—</span>}
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* мобильные карточки */}
        <div className="only-mobile">
          {loading &&
            Array.from({ length: 5 }, (_, i) => (
              <div key={`skm-${i}`} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '40%' }} />
              </div>
            ))}

          {!loading &&
            items.map((r) => (
              <Link
                key={r.id}
                to={`/requests/${r.id}`}
                className="today-row"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="tr-main">
                  <div className="tr-title">
                    {r.clientFullName}
                  </div>
                  <div className="tr-sub">
                    {r.equipmentType} · {r.city} · {formatDateTime(r.createdAt)}
                  </div>
                  <div className="tr-sub">
                    {r.masterFullName ? `Мастер: ${r.masterFullName}` : 'Мастер не назначен'}
                  </div>
                </div>
                <div className="tr-right">
                  <StatusBadge status={r.status} />
                  <span className="tr-amount">{r.totalPrice ? formatMoney(r.totalPrice) : '—'}</span>
                </div>
              </Link>
            ))}
        </div>

        {error && !loading && (
          <div className="empty-state">
            <div className="icon-wrap">
              <IconInbox size={24} />
            </div>
            <h3>Не удалось загрузить заявки</h3>
            <p>{error}</p>
            <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => void load()}>
              Повторить
            </button>
          </div>
        )}

        {isEmpty && (
          <div className="empty-state">
            <div className="icon-wrap">
              <IconClipboardList size={24} />
            </div>
            <h3>Заявок нет</h3>
            <p>
              {(activeFilters.status !== 'All' || activeFilters.masterId || activeFilters.date)
                ? 'По выбранным фильтрам ничего не найдено — попробуйте изменить условия.'
                : 'Создайте первую заявку через API или измените фильтры.'}
            </p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            disabled={loading}
            onPageChange={setPage}
            onPageSizeChange={(n) => {
              setPageSize(n)
              setPage(1)
            }}
          />
        )}
      </div>

      {showCreate && (
        <CreateRequestModal
          busy={creating}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            toast('success', 'Заявка создана')
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
