import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, createMaster, deleteMaster, getMaster, getMasters, updateMaster } from '../lib/api'
import type { Master, MasterDetailed } from '../lib/types'
import { useDebounced } from '../lib/hooks'
import { formatDate, formatMoney, isValidPhone, normalizePhone } from '../lib/format'
import { Pagination } from '../components/Pagination'
import { Modal } from '../components/Modal'
import { ConfirmModal } from '../components/ConfirmModal'
import { StatusBadge } from '../components/StatusBadge'
import { useToast } from '../components/Toasts'
import {
  IconAlertTriangle,
  IconClipboardList,
  IconEye,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconWrench,
} from '../components/icons'

type ActiveFilter = 'all' | 'true' | 'false'

export function MastersPage() {
  const toast = useToast()

  const [items, setItems] = useState<Master[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounced(search)
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [viewing, setViewing] = useState<Master | null>(null)
  const [editing, setEditing] = useState<Master | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Master | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMasters({
        isActive: activeFilter === 'all' ? undefined : activeFilter === 'true',
        search: debouncedSearch.trim() || undefined,
        page,
        pageSize,
      })
      setItems(res.items)
      setTotalCount(res.totalCount)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось загрузить мастеров')
    } finally {
      setLoading(false)
    }
  }, [activeFilter, debouncedSearch, page, pageSize])

  useEffect(() => {
    void load()
  }, [load])

  const runAction = async (fn: () => Promise<unknown>, msg: string) => {
    setBusy(true)
    try {
      await fn()
      toast('success', msg)
      setCreating(false)
      setEditing(null)
      setDeleting(null)
      await load()
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Что-то пошло не так')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page fade-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Мастера</h1>
          <div className="page-subtitle">{loading ? 'Загрузка…' : `Всего мастеров: ${totalCount}`}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          <IconPlus size={16} />
          Добавить мастера
        </button>
      </div>

      <div className="toolbar">
        <div className="chip-row">
          {([['all', 'Все'], ['true', 'Активные'], ['false', 'Неактивные']] as const).map(([v, label]) => (
            <button
              key={v}
              className={`chip ${activeFilter === v ? 'active' : ''}`}
              onClick={() => {
                setActiveFilter(v)
                setPage(1)
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="toolbar-spacer" />
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            placeholder="Поиск по имени…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            style={{ paddingLeft: 34, width: 240 }}
          />
          <IconSearch size={15} style={{ position: 'absolute', left: 11, top: 11, color: 'var(--text-faint)' }} />
        </div>
      </div>

      <div className="card table-card">
        <div className="table-wrap only-desktop">
          <table className="requests">
            <thead>
              <tr>
                <th>Мастер</th>
                <th>Телефон</th>
                <th>Город</th>
                <th>Специализации</th>
                <th className="col-right">Комиссия</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: Math.min(pageSize, 6) }, (_, i) => (
                  <tr key={`sk-${i}`}>
                    {Array.from({ length: 7 }, (_, j) => (
                      <td key={j}>
                        <div className="skeleton" style={{ height: 14, width: `${50 + ((i * 17 + j * 23) % 45)}%` }} />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading &&
                items.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setViewing(m)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setViewing(m)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div className="cell-main">{m.fullname}</div>
                      <div className="cell-sub">{m.telegram}</div>
                    </td>
                    <td className="mono-num">
                      <a
                        href={`tel:${m.phoneNumber}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {m.phoneNumber}
                      </a>
                    </td>
                    <td>{m.city}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {m.specialization.map((s) => (
                          <span key={s} className="spec-tag">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="amount-cell">{m.commissionPercent}%</td>
                    <td>
                      <span className={`badge ${m.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                        <span className="dot" />
                        {m.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Просмотр заявок мастера"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewing(m)
                          }}
                        >
                          <IconEye size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Изменить"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditing(m)
                          }}
                        >
                          <IconPencil size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Удалить"
                          style={{ color: 'var(--rose)' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleting(m)
                          }}
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="only-mobile">
          {loading &&
            Array.from({ length: 5 }, (_, i) => (
              <div key={`skm-${i}`} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: 14, width: '55%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '40%' }} />
              </div>
            ))}
          {!loading &&
            items.map((m) => (
              <div
                key={m.id}
                className="today-row"
                onClick={() => setViewing(m)}
                style={{ cursor: 'pointer' }}
              >
                <div className="tr-main">
                  <div className="tr-title">{m.fullname}</div>
                  <div className="tr-sub mono-num">{m.phoneNumber} · {m.telegram}</div>
                  <div className="tr-sub">
                    {m.city} · {m.commissionPercent}% ·{' '}
                    {m.specialization.map((s) => (
                      <span key={s} className="spec-tag">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="tr-right">
                  <span className={`badge ${m.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                    <span className="dot" />
                    {m.isActive ? 'Активен' : 'Нет'}
                  </span>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditing(m)
                    }}
                    aria-label="Изменить"
                  >
                    <IconPencil size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon"
                    style={{ color: 'var(--red)' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleting(m)
                    }}
                    aria-label="Удалить"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
        </div>

        {error && !loading && (
          <div className="empty-state">
            <h3>Не удалось загрузить</h3>
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="empty-state">
            <div className="icon-wrap"><IconWrench size={24} /></div>
            <h3>Мастеров нет</h3>
            <p>Добавьте первого мастера кнопкой выше.</p>
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

      {viewing && (
        <MasterDetailsModal
          master={viewing}
          onClose={() => setViewing(null)}
          onEdit={(m) => {
            setViewing(null)
            setEditing(m)
          }}
        />
      )}

      {(creating || editing) && (
        <MasterFormModal
          master={editing}
          busy={busy}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSubmit={(dto) =>
            runAction(
              () => (editing ? updateMaster(editing.id, dto) : createMaster(dto)),
              editing ? 'Мастер обновлён' : 'Мастер добавлен',
            )
          }
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Удалить мастера?"
          message={`Мастер «${deleting.fullname}» будет удалён безвозвратно.`}
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={() => runAction(() => deleteMaster(deleting.id), 'Мастер удалён')}
        />
      )}
    </div>
  )
}

/* ================= форма ================= */

function MasterFormModal({
  master,
  busy,
  onClose,
  onSubmit,
}: {
  master: Master | null
  busy: boolean
  onClose: () => void
  onSubmit: (dto: {
    fullname: string
    phoneNumber: string
    telegram: string
    city: string
    specialization: string[]
    commissionPercent: number
    isActive: boolean
  }) => Promise<unknown>
}) {
  const [fullname, setFullname] = useState(master?.fullname ?? '')
  const [phoneNumber, setPhoneNumber] = useState(master?.phoneNumber ?? '')
  const [telegram, setTelegram] = useState(master?.telegram ?? '')
  const [city, setCity] = useState(master?.city ?? '')
  const [specializationRaw, setSpecializationRaw] = useState(master?.specialization.join(', ') ?? '')
  const [commissionPercent, setCommissionPercent] = useState(String(master?.commissionPercent ?? ''))
  const [isActive, setIsActive] = useState(master?.isActive ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (fullname.trim().length < 3 || fullname.trim().length > 100) e.fullname = 'Имя: от 3 до 100 символов'
    if (!isValidPhone(phoneNumber)) e.phoneNumber = 'Введите номер (например: 89001234567 или +79001234567)'
    if (!telegram.trim().startsWith('@') || telegram.trim().length < 2) e.telegram = 'Telegram должен начинаться с @'
    if (city.trim().length < 2 || city.trim().length > 25) e.city = 'Город: от 2 до 25 символов'
    if (specializationRaw.split(',').filter((s) => s.trim()).length === 0) {
      e.specialization = 'Добавьте хотя бы одну специализацию'
    }
    const pct = Number(commissionPercent)
    if (Number.isNaN(pct) || pct < 0 || pct > 100) e.commissionPercent = 'Комиссия: от 0 до 100'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    setServerError(null)
    if (!validate()) return
    try {
      await onSubmit({
        fullname: fullname.trim(),
        phoneNumber: normalizePhone(phoneNumber),
        telegram: telegram.trim(),
        city: city.trim(),
        specialization: specializationRaw.split(',').map((s) => s.trim()).filter(Boolean),
        commissionPercent: Number(commissionPercent),
        isActive,
      })
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Не удалось сохранить')
    }
  }

  return (
    <Modal
      title={master ? `Редактирование · ${master.fullname}` : 'Новый мастер'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Отмена</button>
          <button className="btn btn-primary" onClick={() => void submit()} disabled={busy}>
            {master ? 'Сохранить' : 'Добавить'}
          </button>
        </>
      }
    >
      {serverError && (
        <div className="login-error" role="alert">⚠ <span>{serverError}</span></div>
      )}
      <div className="form-grid">
        <div className="field span-2">
          <label className="label" htmlFor="m-name">ФИО<span className="req">*</span></label>
          <input id="m-name" className={`input ${errors.fullname ? 'invalid' : ''}`} maxLength={100} value={fullname} onChange={(e) => setFullname(e.target.value)} autoFocus />
          {errors.fullname && <span className="field-error">{errors.fullname}</span>}
        </div>
        <div className="field">
          <label className="label" htmlFor="m-phone">Телефон<span className="req">*</span></label>
          <input
            id="m-phone"
            className={`input ${errors.phoneNumber ? 'invalid' : ''}`}
            placeholder="89001234567"
            maxLength={18}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          {errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
        </div>
        <div className="field">
          <label className="label" htmlFor="m-tg">Telegram<span className="req">*</span></label>
          <input id="m-tg" className={`input ${errors.telegram ? 'invalid' : ''}`} placeholder="@username" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
          {errors.telegram && <span className="field-error">{errors.telegram}</span>}
        </div>
        <div className="field">
          <label className="label" htmlFor="m-city">Город<span className="req">*</span></label>
          <input id="m-city" className={`input ${errors.city ? 'invalid' : ''}`} maxLength={25} value={city} onChange={(e) => setCity(e.target.value)} />
          {errors.city && <span className="field-error">{errors.city}</span>}
        </div>
        <div className="field">
          <label className="label" htmlFor="m-percent">Комиссия, %<span className="req">*</span></label>
          <input id="m-percent" className={`input ${errors.commissionPercent ? 'invalid' : ''}`} inputMode="numeric" placeholder="10" value={commissionPercent} onChange={(e) => setCommissionPercent(e.target.value)} />
          {errors.commissionPercent && <span className="field-error">{errors.commissionPercent}</span>}
        </div>
        <div className="field span-2">
          <label className="label" htmlFor="m-spec">Специализации<span className="req">*</span></label>
          <input id="m-spec" className={`input ${errors.specialization ? 'invalid' : ''}`} placeholder="TV, Phone, Laptop" value={specializationRaw} onChange={(e) => setSpecializationRaw(e.target.value)} />
          <span className="hint">Через запятую: TV, Phone, Laptop…</span>
          {errors.specialization && <span className="field-error">{errors.specialization}</span>}
        </div>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
          <span className="label" style={{ margin: 0 }}>Активен (доступен для назначения)</span>
        </label>
      </div>
    </Modal>
  )
}

/* ================= Модалка детального просмотра мастера ================= */

function MasterDetailsModal({
  master,
  onClose,
  onEdit,
}: {
  master: Master
  onClose: () => void
  onEdit: (master: Master) => void
}) {
  const [detailed, setDetailed] = useState<MasterDetailed | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    getMaster(master.id)
      .then((d) => {
        if (alive) setDetailed(d)
      })
      .catch((e) => {
        if (alive) setError(e instanceof ApiError ? e.message : 'Не удалось загрузить данные мастера')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [master.id])

  const completedRequests = (detailed?.requests ?? []).filter((r) => r.status === 'Completed')
  const totalEarned = completedRequests.reduce((sum, r) => sum + (r.masterPayout ?? 0), 0)
  const totalRevenue = completedRequests.reduce((sum, r) => sum + (r.totalPrice ?? 0), 0)

  return (
    <Modal
      title={master.fullname}
      subtitle={master.city ?? 'Город не указан'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Закрыть
          </button>
          <button className="btn btn-primary" onClick={() => onEdit(master)}>
            <IconPencil size={14} />
            Редактировать
          </button>
        </>
      }
    >
      <div className="client-detail-header">
        <div className="info-grid" style={{ marginBottom: 16 }}>
          <div className="info-item">
            <div className="k">Телефон</div>
            <div className="v mono-num">
              <a href={`tel:${master.phoneNumber}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {master.phoneNumber}
              </a>
            </div>
          </div>
          <div className="info-item">
            <div className="k">Telegram</div>
            <div className="v">{master.telegram}</div>
          </div>
          <div className="info-item">
            <div className="k">Комиссия мастера</div>
            <div className="v mono-num">{master.commissionPercent}%</div>
          </div>
          <div className="info-item">
            <div className="k">Статус активности</div>
            <div className="v">
              <span className={`badge ${master.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                <span className="dot" />
                {master.isActive ? 'Активен' : 'Неактивен'}
              </span>
            </div>
          </div>
        </div>

        <div className="info-grid" style={{ marginBottom: 16 }}>
          <div className="info-item">
            <div className="k">Всего заявок</div>
            <div className="v mono-num">{loading ? '…' : detailed?.requests.length ?? 0}</div>
          </div>
          <div className="info-item">
            <div className="k">Завершено заявок</div>
            <div className="v mono-num">{loading ? '…' : completedRequests.length}</div>
          </div>
          <div className="info-item">
            <div className="k">Выручка по заявкам</div>
            <div className="v mono-num">{loading ? '…' : formatMoney(totalRevenue)}</div>
          </div>
          <div className="info-item">
            <div className="k">Выплачено мастеру</div>
            <div className="v mono-num" style={{ color: 'var(--green)' }}>
              {loading ? '…' : formatMoney(totalEarned)}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div
            className="k"
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-faint)',
              marginBottom: 6,
            }}
          >
            Специализации
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {master.specialization.map((s) => (
              <span key={s} className="spec-tag" style={{ fontSize: 12, padding: '3px 9px' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="section-card-title" style={{ fontSize: 14, marginBottom: 10 }}>
        Заявки мастера
      </div>

      {loading && (
        <div className="actions-stack">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 48 }} />
          ))}
        </div>
      )}

      {error && (
        <div className="confirm-warning">
          <IconAlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (detailed?.requests.length ?? 0) === 0 && (
        <div className="empty-state" style={{ padding: '24px 10px' }}>
          <div className="icon-wrap" style={{ width: 40, height: 40 }}>
            <IconClipboardList size={20} />
          </div>
          <h3>У мастера пока нет закреплённых заявок</h3>
          <p>Назначьте мастера на заявку со статусом «Новая» в списке заявок.</p>
        </div>
      )}

      {!loading && (detailed?.requests.length ?? 0) > 0 && (
        <div className="history-list">
          {detailed!.requests.map((r) => (
            <Link
              key={r.id}
              to={`/requests/${r.id}`}
              className="today-row"
              style={{ textDecoration: 'none', color: 'inherit', borderRadius: 10, padding: '10px 14px' }}
            >
              <div className="tr-main">
                <div className="tr-title">
                  {r.equipmentType} · {r.clientFullName}
                </div>
                <div className="tr-sub">
                  {r.city}, {r.address} · {formatDate(r.createdAt)}
                </div>
              </div>
              <div className="tr-right">
                <StatusBadge status={r.status} />
                <span className="tr-amount">{r.totalPrice ? formatMoney(r.totalPrice) : '—'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Modal>
  )
}


