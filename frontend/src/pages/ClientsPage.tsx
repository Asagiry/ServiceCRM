import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, createClient, createRequest, deleteClient, getClient, getClients, updateClient } from '../lib/api'
import type { Client, ClientDetailed } from '../lib/types'
import { useDebounced } from '../lib/hooks'
import { formatDate, formatMoney, isValidPhone, normalizePhone } from '../lib/format'
import { Pagination } from '../components/Pagination'
import { Modal } from '../components/Modal'
import { ConfirmModal } from '../components/ConfirmModal'
import { CreateRequestModal } from '../components/CreateRequestModal'
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
  IconUsers,
} from '../components/icons'

export function ClientsPage() {
  const toast = useToast()

  const [items, setItems] = useState<Client[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounced(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [viewing, setViewing] = useState<Client | null>(null)
  const [editing, setEditing] = useState<Client | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Client | null>(null)
  const [creatingRequestFor, setCreatingRequestFor] = useState<Client | null>(null)
  const [requestBusy, setRequestBusy] = useState(false)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getClients({
        search: debouncedSearch.trim() || undefined,
        page,
        pageSize,
      })
      setItems(res.items)
      setTotalCount(res.totalCount)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось загрузить клиентов')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page, pageSize])

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
          <h1 className="page-title">Клиенты</h1>
          <div className="page-subtitle">{loading ? 'Загрузка…' : `Всего клиентов: ${totalCount}`}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          <IconPlus size={16} />
          Добавить клиента
        </button>
      </div>

      <div className="toolbar">
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            placeholder="Поиск по имени или телефону…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            style={{ paddingLeft: 34, width: 300 }}
          />
          <IconSearch size={15} style={{ position: 'absolute', left: 11, top: 11, color: 'var(--text-faint)' }} />
        </div>
      </div>

      <div className="card table-card">
        <div className="table-wrap only-desktop">
          <table className="requests">
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Телефон</th>
                <th>Город</th>
                <th>Добавлен</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: Math.min(pageSize, 6) }, (_, i) => (
                  <tr key={`sk-${i}`}>
                    {Array.from({ length: 5 }, (_, j) => (
                      <td key={j}>
                        <div className="skeleton" style={{ height: 14, width: `${50 + ((i * 19 + j * 31) % 45)}%` }} />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading &&
                items.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setViewing(c)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setViewing(c)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="cell-main">{c.fullName}</td>
                    <td className="mono-num">
                      <a
                        href={`tel:${c.phoneNumber}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.phoneNumber}
                      </a>
                    </td>
                    <td>{c.city}</td>
                    <td className="mono-num" style={{ color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {formatDate(c.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Просмотр заявок"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewing(c)
                          }}
                        >
                          <IconEye size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Изменить"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditing(c)
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
                            setDeleting(c)
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
            items.map((c) => (
              <div
                key={c.id}
                className="today-row"
                onClick={() => setViewing(c)}
                style={{ cursor: 'pointer' }}
              >
                <div className="tr-main">
                  <div className="tr-title">{c.fullName}</div>
                  <div className="tr-sub mono-num">{c.phoneNumber}</div>
                  <div className="tr-sub">{c.city} · добавлен {formatDate(c.createdAt)}</div>
                </div>
                <div className="tr-right">
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditing(c)
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
                      setDeleting(c)
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
            <div className="icon-wrap"><IconUsers size={24} /></div>
            <h3>{debouncedSearch ? 'Ничего не найдено' : 'Клиентов нет'}</h3>
            <p>{debouncedSearch ? 'Попробуйте изменить запрос.' : 'Добавьте первого клиента кнопкой выше.'}</p>
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
        <ClientDetailsModal
          client={viewing}
          onClose={() => setViewing(null)}
          onEdit={(c) => {
            setViewing(null)
            setEditing(c)
          }}
          onCreateRequest={(c) => {
            setViewing(null)
            setCreatingRequestFor(c)
          }}
        />
      )}

      {creatingRequestFor && (
        <CreateRequestModal
          busy={requestBusy}
          initialClientId={creatingRequestFor.id}
          onClose={() => setCreatingRequestFor(null)}
          onCreated={() => {
            setCreatingRequestFor(null)
            toast('success', 'Заявка успешно создана')
          }}
          onSubmit={(dto) => {
            setRequestBusy(true)
            return createRequest(dto).finally(() => setRequestBusy(false))
          }}
        />
      )}

      {(creating || editing) && (
        <ClientFormModal
          client={editing}
          busy={busy}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSubmit={(dto) =>
            runAction(
              () => (editing ? updateClient(editing.id, dto) : createClient(dto)),
              editing ? 'Клиент обновлён' : 'Клиент добавлен',
            )
          }
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Удалить клиента?"
          message={`Клиент «${deleting.fullName}» будет удалён безвозвратно.`}
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={() => runAction(() => deleteClient(deleting.id), 'Клиент удалён')}
        />
      )}
    </div>
  )
}

/* ================= форма ================= */

function ClientFormModal({
  client,
  busy,
  onClose,
  onSubmit,
}: {
  client: Client | null
  busy: boolean
  onClose: () => void
  onSubmit: (dto: { fullName: string; phoneNumber: string; city: string }) => Promise<unknown>
}) {
  const [fullName, setFullName] = useState(client?.fullName ?? '')
  const [phoneNumber, setPhoneNumber] = useState(client?.phoneNumber ?? '')
  const [city, setCity] = useState(client?.city ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (fullName.trim().length < 10 || fullName.trim().length > 100) e.fullName = 'Имя: от 10 до 100 символов (Фамилия Имя)'
    if (!isValidPhone(phoneNumber)) e.phoneNumber = 'Введите номер (например: 89001234567 или +79001234567)'
    if (city.trim().length < 2 || city.trim().length > 25) e.city = 'Город: от 2 до 25 символов'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    setServerError(null)
    if (!validate()) return
    try {
      await onSubmit({
        fullName: fullName.trim(),
        phoneNumber: normalizePhone(phoneNumber),
        city: city.trim(),
      })
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Не удалось сохранить')
    }
  }

  return (
    <Modal
      title={client ? `Редактирование · ${client.fullName}` : 'Новый клиент'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Отмена</button>
          <button className="btn btn-primary" onClick={() => void submit()} disabled={busy}>
            {client ? 'Сохранить' : 'Добавить'}
          </button>
        </>
      }
    >
      {serverError && (
        <div className="login-error" role="alert">⚠ <span>{serverError}</span></div>
      )}
      <div className="form-grid">
        <div className="field span-2">
          <label className="label" htmlFor="cl-name">Имя<span className="req">*</span></label>
          <input id="cl-name" className={`input ${errors.fullName ? 'invalid' : ''}`} placeholder="Иванов Иван" maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} autoFocus />
          {errors.fullName && <span className="field-error">{errors.fullName}</span>}
        </div>
        <div className="field span-2">
          <label className="label" htmlFor="cl-phone">Телефон<span className="req">*</span></label>
          <input
            id="cl-phone"
            className={`input ${errors.phoneNumber ? 'invalid' : ''}`}
            placeholder="89001234567"
            maxLength={18}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          {errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
        </div>
        <div className="field span-2">
          <label className="label" htmlFor="cl-city">Город<span className="req">*</span></label>
          <input id="cl-city" className={`input ${errors.city ? 'invalid' : ''}`} maxLength={25} value={city} onChange={(e) => setCity(e.target.value)} />
          {errors.city && <span className="field-error">{errors.city}</span>}
        </div>
      </div>
    </Modal>
  )
}

/* ================= Модалка детального просмотра клиента ================= */

function ClientDetailsModal({
  client,
  onClose,
  onCreateRequest,
  onEdit,
}: {
  client: Client
  onClose: () => void
  onCreateRequest: (client: Client) => void
  onEdit: (client: Client) => void
}) {
  const [detailed, setDetailed] = useState<ClientDetailed | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    getClient(client.id)
      .then((d) => {
        if (alive) setDetailed(d)
      })
      .catch((e) => {
        if (alive) setError(e instanceof ApiError ? e.message : 'Не удалось загрузить данные клиента')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [client.id])

  const totalSpent = (detailed?.requests ?? [])
    .filter((r) => r.status === 'Completed')
    .reduce((sum, r) => sum + (r.totalPrice ?? 0), 0)

  return (
    <Modal
      title={client.fullName}
      subtitle={`Добавлен ${formatDate(client.createdAt)}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Закрыть
          </button>
          <button className="btn btn-ghost" onClick={() => onEdit(client)}>
            <IconPencil size={14} />
            Редактировать
          </button>
          <button className="btn btn-primary" onClick={() => onCreateRequest(client)}>
            <IconPlus size={15} />
            Новая заявка
          </button>
        </>
      }
    >
      <div className="client-detail-header">
        <div className="info-grid" style={{ marginBottom: 18 }}>
          <div className="info-item">
            <div className="k">Телефон</div>
            <div className="v mono-num">
              <a href={`tel:${client.phoneNumber}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {client.phoneNumber}
              </a>
            </div>
          </div>
          <div className="info-item">
            <div className="k">Город</div>
            <div className="v">{client.city ?? '—'}</div>
          </div>
          <div className="info-item">
            <div className="k">Всего заявок</div>
            <div className="v mono-num">{loading ? '…' : detailed?.requests.length ?? 0}</div>
          </div>
          <div className="info-item">
            <div className="k">Сумма завершённых</div>
            <div className="v mono-num" style={{ color: 'var(--green)' }}>
              {loading ? '…' : formatMoney(totalSpent)}
            </div>
          </div>
        </div>
      </div>

      <div className="section-card-title" style={{ fontSize: 14, marginBottom: 10 }}>
        История заявок клиента
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
          <h3>У клиента пока нет заявок</h3>
          <p>Нажмите «Новая заявка», чтобы создать первый заказ для этого клиента.</p>
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
                  {r.equipmentType}
                </div>
                <div className="tr-sub">
                  {r.city}, {r.address} · {formatDate(r.createdAt)}
                  {r.masterFullName ? ` · мастер: ${r.masterFullName}` : ''}
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


