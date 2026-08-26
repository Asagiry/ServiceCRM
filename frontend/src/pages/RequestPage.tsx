import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ApiError,
  completeRequest,
  createPayment,
  deleteRequest,
  getActiveMasters,
  getAllLeadSources,
  getPayment,
  getRequest,
  updateRequest,
  updateRequestStatus,
} from '../lib/api'
import type { LeadSource, Master, PaymentMethod, RequestStatus, ServiceRequest } from '../lib/types'
import {
  ALLOWED_TRANSITIONS,
  PAYMENT_METHOD_LABELS,
  STATUS_LABELS,
} from '../lib/types'
import { formatDate, formatDateTime, formatMoney } from '../lib/format'
import { StatusBadge } from '../components/StatusBadge'
import { Modal } from '../components/Modal'
import { ConfirmModal } from '../components/ConfirmModal'
import { useToast } from '../components/Toasts'
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBanknote,
  IconCalendar,
  IconCheck,
  IconMapPin,
  IconMegaphone,
  IconPencil,
  IconPhone,
  IconTrash,
  IconUser,
} from '../components/icons'

/** Порядок шагов для визуализации прогресса.
 *  Диспетчер работает без «В работе»: Новая → Назначена → Завершена.
 *  Легаси-статус InProgress отображается отдельным сценарием в Stepper. */
const MAIN_FLOW: RequestStatus[] = ['New', 'Assigned', 'Completed']

export function RequestPage() {
  const { id } = useParams()
  const requestId = Number(id)
  const navigate = useNavigate()
  const toast = useToast()

  const [request, setRequest] = useState<ServiceRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [payment, setPayment] = useState<{ amount: number; paymentMethod: PaymentMethod; paymentDate: string } | null>(null)

  const [busy, setBusy] = useState(false)
  const [modal, setModal] = useState<'assign' | 'complete' | 'payment' | 'cancel' | 'edit' | 'delete' | null>(null)

  const refresh = useCallback(async () => {
    try {
      const r = await getRequest(requestId)
      setRequest(r)
      setNotFound(false)
      try {
        const p = await getPayment(requestId)
        setPayment({ amount: p.amount, paymentMethod: p.paymentMethod, paymentDate: p.paymentDate })
      } catch {
        setPayment(null)
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setNotFound(true)
      else toast('error', err instanceof ApiError ? err.message : 'Не удалось загрузить заявку')
    } finally {
      setLoading(false)
    }
  }, [requestId, toast])

  useEffect(() => {
    setLoading(true)
    void refresh()
  }, [refresh])

  /** Универсальный раннер действий: крутит спиннер, ловит ошибки формата А/Б. */
  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    setBusy(true)
    try {
      await fn()
      toast('success', successMsg)
      setModal(null)
      await refresh()
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Что-то пошло не так')
    } finally {
      setBusy(false)
    }
  }

  const cancel = () => runAction(() => updateRequestStatus(requestId, 'Cancelled'), 'Заявка отменена')

  if (loading) {
    return (
      <div className="page fade-up">
        <div className="skeleton" style={{ height: 20, width: 120, marginBottom: 22 }} />
        <div className="req-layout">
          <div>
            <div className="card panel">
              <div className="skeleton" style={{ height: 16, width: 160, marginBottom: 20 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="skeleton" style={{ height: 32 }} />
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="card panel">
              <div className="skeleton" style={{ height: 200 }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !request) {
    return (
      <div className="page fade-up">
        <Link to="/requests" className="back-link">
          <IconArrowLeft size={15} /> К списку заявок
        </Link>
        <div className="card">
          <div className="empty-state">
            <div className="icon-wrap">
              <IconAlertTriangle size={24} />
            </div>
            <h3>Заявка не найдена</h3>
            <p>Возможно, она была удалена.</p>
            <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/requests')}>
              Вернуться к списку
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isTerminal = request.status === 'Completed' || request.status === 'Cancelled'
  const canTransitionTo = (t: RequestStatus) => ALLOWED_TRANSITIONS[request.status].includes(t)
  const canAcceptPayment =
    request.status !== 'Cancelled' && !payment && (request.totalPrice ?? 0) > 0

  return (
    <div className="page fade-up">
      <Link to="/requests" className="back-link">
        <IconArrowLeft size={15} /> Все заявки
      </Link>

      <div className="page-head" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h1 className="page-title">{request.equipmentType}</h1>
          <StatusBadge status={request.status} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-ghost"
            disabled={busy || isTerminal}
            onClick={() => setModal('edit')}
            title={isTerminal ? 'Нельзя редактировать завершенную/отмененную заявку' : 'Редактировать'}
          >
            <IconPencil size={15} />
            Редактировать
          </button>
          <button
            className="btn btn-ghost"
            style={{ color: 'var(--rose)' }}
            disabled={busy}
            onClick={() => setModal('delete')}
            title="Удалить заявку"
          >
            <IconTrash size={15} />
            Удалить
          </button>
        </div>
      </div>

      <div className="req-layout">
        {/* ---------- левая колонка ---------- */}
        <div>
          <section className="card panel">
            <h2 className="panel-title">Информация о заявке</h2>
            <div className="info-grid">
              <div className="info-item">
                <div className="k">Город</div>
                <div className="v">{request.city}</div>
              </div>
              <div className="info-item">
                <div className="k">Адрес</div>
                <div className="v">{request.address}</div>
              </div>
              <div className="info-item">
                <div className="k">Тип техники</div>
                <div className="v">{request.equipmentType}</div>
              </div>
              <div className="info-item">
                <div className="k">Запланировано</div>
                <div className="v">{request.scheduledAt ? formatDateTime(request.scheduledAt) : '—'}</div>
              </div>
              <div className="info-item">
                <div className="k">Источник лида</div>
                <div className="v">{request.leadSourceName ?? '—'}</div>
              </div>
              <div className="info-item">
                <div className="k">Создана</div>
                <div className="v">{formatDateTime(request.createdAt)}</div>
              </div>
            </div>

            <hr className="divider" />

            <h2 className="panel-title">Описание проблемы</h2>
            <p className="problem-text">{request.problemDescription}</p>
          </section>

          <section className="card panel">
            <h2 className="panel-title">Клиент и мастер</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div className="contact-line">
                  <span className="icon-wrap"><IconUser size={16} /></span>
                  <div>
                    <div className="label">Клиент</div>
                    <div className="value">{request.clientFullName}</div>
                  </div>
                </div>
                <div className="contact-line">
                  <span className="icon-wrap"><IconPhone size={15} /></span>
                  <div>
                    <div className="label">Телефон</div>
                    <a className="value mono-num" href={`tel:${request.clientPhoneNumber}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {request.clientPhoneNumber}
                    </a>
                  </div>
                </div>
                <div className="contact-line">
                  <span className="icon-wrap"><IconMapPin size={16} /></span>
                  <div>
                    <div className="label">Адрес выезда</div>
                    <div className="value">{request.city}, {request.address}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="contact-line">
                  <span className="icon-wrap"><IconUser size={16} /></span>
                  <div>
                    <div className="label">Мастер</div>
                    <div className="value">
                      {request.masterFullName ? (
                        request.masterFullName
                      ) : (
                        <span className="faint" style={{ fontWeight: 500 }}>Не назначен</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="contact-line">
                  <span className="icon-wrap"><IconMegaphone size={16} /></span>
                  <div>
                    <div className="label">Пришло из</div>
                    <div className="value">{request.leadSourceName ?? '—'}</div>
                  </div>
                </div>
                <div className="contact-line">
                  <span className="icon-wrap"><IconCalendar size={15} /></span>
                  <div>
                    <div className="label">Дата создания</div>
                    <div className="value">{formatDate(request.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {(request.totalPrice !== undefined || payment) && (
            <section className="card panel">
              <h2 className="panel-title">Финансы</h2>
              <div className="finance-row total">
                <span className="k">Стоимость работ</span>
                <span className="v">{formatMoney(request.totalPrice)}</span>
              </div>
              {request.directExpenses !== undefined && (
                <>
                  <div className="finance-row">
                    <span className="k">Прямые расходы</span>
                    <span className="v">{formatMoney(request.directExpenses)}</span>
                  </div>
                  {request.masterPayout !== undefined && (
                    <div className="finance-row">
                      <span className="k">Выплата мастеру</span>
                      <span className="v">{formatMoney(request.masterPayout)}</span>
                    </div>
                  )}
                  <div className="finance-row">
                    <span className="k">Прибыль владельца</span>
                    <span className="v" style={{ color: 'var(--green)' }}>
                      {formatMoney(
                        (request.totalPrice ?? 0) -
                          (request.directExpenses ?? 0) -
                          (request.masterPayout ?? 0),
                      )}
                    </span>
                  </div>
                </>
              )}

              <hr className="divider" />

              {payment ? (
                <div className="paid-banner">
                  <IconCheck size={17} />
                  Оплачено {formatMoney(payment.amount)} ·{' '}
                  {PAYMENT_METHOD_LABELS[payment.paymentMethod]} · {formatDateTime(payment.paymentDate)}
                </div>
              ) : canAcceptPayment ? (
                <button className="btn btn-success btn-block" onClick={() => setModal('payment')} disabled={busy}>
                  <IconBanknote size={16} />
                  Принять оплату · {formatMoney(request.totalPrice)}
                </button>
              ) : (
                <div className="faint" style={{ textAlign: 'center', fontSize: 12.5 }}>
                  Оплата ещё не внесена
                </div>
              )}
            </section>
          )}
        </div>

        {/* ---------- правая колонка ---------- */}
        <div>
          <section className="card panel">
            <h2 className="panel-title">Статус заявки</h2>
            <Stepper status={request.status} />
          </section>

          <section className="card panel">
            <h2 className="panel-title">Действия</h2>
            <div className="actions-stack">
              {!isTerminal && (
                <>
                  {(canTransitionTo('Assigned') || request.status === 'Assigned') && (
                    <button className="btn btn-primary btn-block" disabled={busy} onClick={() => setModal('assign')}>
                      {request.masterId ? 'Сменить мастера' : 'Назначить мастера'}
                    </button>
                  )}

                  {canTransitionTo('Completed') && (
                    <button className="btn btn-success btn-block" disabled={busy} onClick={() => setModal('complete')}>
                      <IconCheck size={16} />
                      Завершить с финансами
                    </button>
                  )}

                  {canTransitionTo('Cancelled') && (
                    <>
                      <hr className="divider" style={{ margin: '6px 0' }} />
                      <button className="btn btn-danger btn-block" disabled={busy} onClick={() => setModal('cancel')}>
                        Отменить заявку
                      </button>
                    </>
                  )}
                </>
              )}

              {isTerminal && (
                <div className="faint" style={{ textAlign: 'center', padding: '8px 0', lineHeight: 1.6 }}>
                  Статус «{STATUS_LABELS[request.status]}» — терминальный.
                  <br />
                  Изменения недоступны.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ---------- модалки ---------- */}
      {modal === 'assign' && (
        <AssignMasterModal
          request={request}
          busy={busy}
          onClose={() => setModal(null)}
          onSave={(masterId) =>
            // PUT заменяет все поля целиком — отправляем актуальные данные заявки.
            // Назначение мастера на новой заявке переводит её в Assigned (New → Assigned разрешён).
            runAction(
              () =>
                updateRequest(requestId, {
                  clientId: request.clientId,
                  masterId,
                  city: request.city,
                  address: request.address,
                  leadSourceId: request.leadSourceId,
                  problemDescription: request.problemDescription,
                  equipmentType: request.equipmentType,
                  scheduledAt: request.scheduledAt,
                  status: request.status === 'New' ? 'Assigned' : request.status,
                }),
              request.status === 'New'
                ? 'Мастер назначен, заявка переведена в «Назначена»'
                : 'Мастер обновлён',
            )
          }
        />
      )}

      {modal === 'complete' && (
        <CompleteModal
          busy={busy}
          onClose={() => setModal(null)}
          onSubmit={(dto) =>
            runAction(() => completeRequest(requestId, dto), 'Заявка завершена')
          }
        />
      )}

      {modal === 'payment' && (
        <PaymentModal
          totalPrice={request.totalPrice ?? 0}
          busy={busy}
          onClose={() => setModal(null)}
          onSubmit={(dto) => runAction(() => createPayment(requestId, dto), 'Оплата принята')}
        />
      )}

      {modal === 'cancel' && <CancelConfirm busy={busy} onCancel={() => setModal(null)} onConfirm={cancel} />}

      {modal === 'edit' && (
        <EditRequestModal
          request={request}
          busy={busy}
          onClose={() => setModal(null)}
          onSave={(dto) =>
            runAction(
              () =>
                updateRequest(requestId, {
                  ...dto,
                  masterId: request.masterId,
                  status: request.status,
                }),
              'Заявка обновлена',
            )
          }
        />
      )}

      {modal === 'delete' && (
        <ConfirmModal
          title="Удалить заявку?"
          message={`Заявка «${request.equipmentType}» (клиент: ${request.clientFullName}) будет удалена безвозвратно.`}
          busy={busy}
          onCancel={() => setModal(null)}
          onConfirm={() =>
            runAction(
              () => deleteRequest(requestId).then(() => navigate('/requests', { replace: true })),
              'Заявка удалена',
            )
          }
        />
      )}
    </div>
  )
}

/* ================= Stepper ================= */

function Stepper({ status }: { status: RequestStatus }) {
  if (status === 'Cancelled') {
    return (
      <div className="stepper">
        <Step label={STATUS_LABELS['New']} dim isLast={false} />
        <Step label="Отменена" cancelled isLast={true} />
      </div>
    )
  }

  // Заявки, застрявшие в легаси-статусе «В работе», показываем по старому 4-шаговому флоу
  const flow: RequestStatus[] = status === 'InProgress' ? ['New', 'Assigned', 'InProgress', 'Completed'] : MAIN_FLOW
  const currentIdx = flow.indexOf(status)

  return (
    <div className="stepper">
      {flow.map((s, i) => (
        <Step
          key={s}
          label={STATUS_LABELS[s]}
          done={i < currentIdx}
          current={i === currentIdx}
          isLast={i === flow.length - 1}
        />
      ))}
    </div>
  )
}

function Step({
  label,
  done,
  current,
  cancelled,
  dim,
  isLast,
}: {
  label: string
  done?: boolean
  current?: boolean
  cancelled?: boolean
  dim?: boolean
  isLast?: boolean
}) {
  return (
    <div className="step">
      <div className="step-rail">
        <div className={`step-dot ${done ? 'done' : ''} ${current ? 'current' : ''} ${cancelled ? 'cancelled' : ''}`}>
          {done ? (
            <IconCheck size={13} />
          ) : cancelled ? (
            <IconX size={12} />
          ) : current ? (
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
          ) : null}
        </div>
        {!isLast && <div className={`step-line ${done ? 'done' : ''}`} />}
      </div>
      <div className="step-body">
        <div className={`step-name ${(!done && !current && !cancelled) || dim ? 'dim' : ''}`}>{label}</div>
      </div>
    </div>
  )
}

function IconX({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

/* ================= Модалка назначения мастера ================= */

function AssignMasterModal({
  request,
  busy,
  onClose,
  onSave,
}: {
  request: ServiceRequest
  busy: boolean
  onClose: () => void
  onSave: (masterId: number) => void
}) {
  const [masters, setMasters] = useState<Master[] | null>(null)
  const [selected, setSelected] = useState<number | ''>(request.masterId ?? '')
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    getActiveMasters()
      .then((m) => alive && setMasters(m))
      .catch((e) => alive && setLoadError(e instanceof ApiError ? e.message : 'Не удалось загрузить мастеров'))
    return () => {
      alive = false
    }
  }, [])

  return (
    <Modal title="Назначение мастера" subtitle={`Заявка #${request.id} · ${request.equipmentType}`} onClose={onClose}>
      {masters === null && !loadError && (
        <div className="actions-stack">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 52 }} />
          ))}
        </div>
      )}

      {loadError && (
        <div className="confirm-warning">
          <IconAlertTriangle size={17} />
          {loadError}
        </div>
      )}

      {masters && masters.length === 0 && (
        <div className="empty-state" style={{ padding: '30px 10px' }}>
          <h3>Нет активных мастеров</h3>
          <p>Добавьте мастера через API /api/masters.</p>
        </div>
      )}

      {masters && masters.length > 0 && (
        <div className="field">
          <label className="label" htmlFor="assign-master">Выберите мастера</label>
          <select
            id="assign-master"
            className="select"
            value={selected}
            onChange={(e) => setSelected(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">— не назначен —</option>
            {masters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullname} · {m.city ?? '—'} · {m.commissionPercent}%
              </option>
            ))}
          </select>
          <span className="hint">
            {request.status === 'New'
              ? 'После назначения заявка перейдёт в статус «Назначена».'
              : 'Статус заявки сохранится без изменений.'}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
          Отмена
        </button>
        <button
          className="btn btn-primary"
          disabled={busy || selected === '' || masters === null || masters.length === 0}
          onClick={() => selected !== '' && onSave(selected)}
        >
          Назначить
        </button>
      </div>
    </Modal>
  )
}

/* ================= Модалка закрытия заявки ================= */

const MAX_PRICE = 1_000_000

function CompleteModal({
  busy,
  onClose,
  onSubmit,
}: {
  busy: boolean
  onClose: () => void
  onSubmit: (dto: { totalPrice: number; directExpenses: number; masterPayout: number }) => void
}) {
  const [totalPrice, setTotalPrice] = useState('')
  const [directExpenses, setDirectExpenses] = useState('')
  const [masterPayout, setMasterPayout] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const num = (v: string) => (v.trim() === '' ? NaN : Number(v.replace(',', '.')))

  const validate = () => {
    const e: Record<string, string> = {}
    for (const [name, label, raw] of [
      ['totalPrice', 'Стоимость', totalPrice],
      ['directExpenses', 'Прямые расходы', directExpenses],
      ['masterPayout', 'Выплата мастеру', masterPayout],
    ] as const) {
      const v = num(raw)
      if (Number.isNaN(v)) e[name] = `${label}: укажите число`
      else if (v < 0 || v > MAX_PRICE) e[name] = `${label}: от 0 до 1 000 000`
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const profit =
    (!Number.isNaN(num(totalPrice)) ? num(totalPrice) : 0) -
    (!Number.isNaN(num(directExpenses)) ? num(directExpenses) : 0) -
    (!Number.isNaN(num(masterPayout)) ? num(masterPayout) : 0)

  return (
    <Modal
      title="Завершение заявки"
      subtitle="Укажите итоговые суммы. После закрытия изменить их будет нельзя."
      onClose={onClose}
    >
      <div className="form-grid">
        <div className="field span-2">
          <label className="label" htmlFor="c-total">Стоимость работ, ₽ *</label>
          <input
            id="c-total"
            className={`input ${errors.totalPrice ? 'invalid' : ''}`}
            inputMode="decimal"
            placeholder="5000"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            autoFocus
          />
          {errors.totalPrice && <span className="field-error">{errors.totalPrice}</span>}
        </div>
        <div className="field">
          <label className="label" htmlFor="c-expenses">Прямые расходы, ₽</label>
          <input
            id="c-expenses"
            className={`input ${errors.directExpenses ? 'invalid' : ''}`}
            inputMode="decimal"
            placeholder="300"
            value={directExpenses}
            onChange={(e) => setDirectExpenses(e.target.value)}
          />
          {errors.directExpenses && <span className="field-error">{errors.directExpenses}</span>}
        </div>
        <div className="field">
          <label className="label" htmlFor="c-payout">Выплата мастеру, ₽</label>
          <input
            id="c-payout"
            className={`input ${errors.masterPayout ? 'invalid' : ''}`}
            inputMode="decimal"
            placeholder="1500"
            value={masterPayout}
            onChange={(e) => setMasterPayout(e.target.value)}
          />
          {errors.masterPayout && <span className="field-error">{errors.masterPayout}</span>}
        </div>
      </div>

      <div className="profit-preview">
        <span>Прибыль владельца</span>
        <span className="v mono-num">{formatMoney(profit)}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Отмена</button>
        <button
          className="btn btn-primary"
          disabled={busy}
          onClick={() => {
            if (!validate()) return
            onSubmit({
              totalPrice: num(totalPrice),
              directExpenses: num(directExpenses),
              masterPayout: num(masterPayout),
            })
          }}
        >
          Завершить заявку
        </button>
      </div>
    </Modal>
  )
}

/* ================= Модалка оплаты ================= */

function PaymentModal({
  totalPrice,
  busy,
  onClose,
  onSubmit,
}: {
  totalPrice: number
  busy: boolean
  onClose: () => void
  onSubmit: (dto: { amount: number; paymentMethod: PaymentMethod }) => void
}) {
  const [amount, setAmount] = useState(String(totalPrice))
  const [method, setMethod] = useState<PaymentMethod>('Cash')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    const v = Number(amount.replace(',', '.'))
    if (Number.isNaN(v) || v <= 0) {
      setError('Сумма должна быть больше нуля')
      return
    }
    if (v > totalPrice) {
      setError(`Сумма платежа не может превышать ${formatMoney(totalPrice)}`)
      return
    }
    setError(null)
    onSubmit({ amount: v, paymentMethod: method })
  }

  return (
    <Modal title="Приём оплаты" subtitle="Один платёж полностью закрывает заявку" onClose={onClose}>
      <div className="form-grid">
        <div className="field">
          <label className="label" htmlFor="p-amount">Сумма, ₽</label>
          <input
            id="p-amount"
            className={`input ${error ? 'invalid' : ''}`}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
          {error && <span className="field-error">{error}</span>}
        </div>
        <div className="field">
          <label className="label" htmlFor="p-method">Способ оплаты</label>
          <select id="p-method" className="select" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
              <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Отмена</button>
        <button className="btn btn-primary" onClick={submit} disabled={busy}>
          Принять {formatMoney(Number(amount.replace(',', '.')) || 0)}
        </button>
      </div>
    </Modal>
  )
}

/* ================= Подтверждение отмены ================= */

function CancelConfirm({
  busy,
  onCancel,
  onConfirm,
}: {
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Modal title="Отменить заявку?" onClose={onCancel}>
      <div className="confirm-warning">
        <IconAlertTriangle size={18} />
        <span>
          Заявка перейдёт в статус «Отменена» без возможности восстановления. Отменить заявку
          с внесённой оплатой нельзя — сервер вернёт ошибку.
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          Вернуться
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          Да, отменить
        </button>
      </div>
    </Modal>
  )
}

/* ================= Модалка редактирования заявки ================= */

function EditRequestModal({
  request,
  busy,
  onClose,
  onSave,
}: {
  request: ServiceRequest
  busy: boolean
  onClose: () => void
  onSave: (dto: {
    clientId: number
    city: string
    address: string
    leadSourceId: number
    problemDescription: string
    equipmentType: string
    scheduledAt?: string
  }) => Promise<unknown>
}) {
  const [sources, setSources] = useState<LeadSource[] | null>(null)
  const [city, setCity] = useState(request.city)
  const [address, setAddress] = useState(request.address)
  const [equipmentType, setEquipmentType] = useState(request.equipmentType)
  const [problemDescription, setProblemDescription] = useState(request.problemDescription)
  const [leadSourceId, setLeadSourceId] = useState(String(request.leadSourceId))
  const [scheduledAt, setScheduledAt] = useState(
    request.scheduledAt ? new Date(request.scheduledAt).toISOString().slice(0, 16) : '',
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    getAllLeadSources()
      .then((s) => alive && setSources(s))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (city.trim().length < 2 || city.trim().length > 25) e.city = 'Город: от 2 до 25 символов'
    if (address.trim().length < 5 || address.trim().length > 100) e.address = 'Адрес: от 5 до 100 символов'
    if (equipmentType.trim().length < 1 || equipmentType.trim().length > 25) e.equipmentType = 'Тип техники: до 25 символов'
    if (problemDescription.trim().length < 1 || problemDescription.trim().length > 500) {
      e.problemDescription = 'Описание: от 1 до 500 символов'
    }
    if (!leadSourceId) e.leadSourceId = 'Выберите источник лида'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    setServerError(null)
    if (!validate()) return
    try {
      await onSave({
        clientId: request.clientId,
        city: city.trim(),
        address: address.trim(),
        equipmentType: equipmentType.trim(),
        problemDescription: problemDescription.trim(),
        leadSourceId: Number(leadSourceId),
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      })
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Не удалось обновить заявку')
    }
  }

  return (
    <Modal
      title="Редактирование заявки"
      subtitle={`Клиент: ${request.clientFullName}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button className="btn btn-primary" onClick={() => void submit()} disabled={busy}>
            Сохранить изменения
          </button>
        </>
      }
    >
      {serverError && (
        <div className="login-error" role="alert">
          ⚠ <span>{serverError}</span>
        </div>
      )}
      <div className="form-grid">
        <div className="field">
          <label className="label" htmlFor="er-city">
            Город выезда<span className="req">*</span>
          </label>
          <input
            id="er-city"
            className={`input ${errors.city ? 'invalid' : ''}`}
            maxLength={25}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoFocus
          />
          {errors.city && <span className="field-error">{errors.city}</span>}
        </div>

        <div className="field">
          <label className="label" htmlFor="er-equipment">
            Тип техники<span className="req">*</span>
          </label>
          <input
            id="er-equipment"
            className={`input ${errors.equipmentType ? 'invalid' : ''}`}
            maxLength={25}
            value={equipmentType}
            onChange={(e) => setEquipmentType(e.target.value)}
          />
          {errors.equipmentType && <span className="field-error">{errors.equipmentType}</span>}
        </div>

        <div className="field span-2">
          <label className="label" htmlFor="er-address">
            Адрес выезда<span className="req">*</span>
          </label>
          <input
            id="er-address"
            className={`input ${errors.address ? 'invalid' : ''}`}
            maxLength={100}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {errors.address && <span className="field-error">{errors.address}</span>}
        </div>

        <div className="field span-2">
          <label className="label" htmlFor="er-source">
            Источник лида<span className="req">*</span>
          </label>
          <select
            id="er-source"
            className={`select ${errors.leadSourceId ? 'invalid' : ''}`}
            value={leadSourceId}
            onChange={(e) => setLeadSourceId(e.target.value)}
          >
            {sources?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.leadSourceId && <span className="field-error">{errors.leadSourceId}</span>}
        </div>

        <div className="field span-2">
          <label className="label" htmlFor="er-problem">
            Описание проблемы<span className="req">*</span>
          </label>
          <textarea
            id="er-problem"
            className={`input ${errors.problemDescription ? 'invalid' : ''}`}
            maxLength={500}
            rows={3}
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
          />
          <span className="hint mono-num">{problemDescription.length}/500</span>
          {errors.problemDescription && <span className="field-error">{errors.problemDescription}</span>}
        </div>

        <div className="field span-2">
          <label className="label" htmlFor="er-scheduled">
            Плановое время выезда мастера
          </label>
          <input
            id="er-scheduled"
            type="datetime-local"
            className="input"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  )
}

