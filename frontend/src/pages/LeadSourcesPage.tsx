import { Fragment, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ApiError,
  createAdExpense,
  createLeadSource,
  deleteAdExpense,
  deleteLeadSource,
  getLeadSource,
  getLeadSources,
  updateLeadSource,
} from '../lib/api'
import type { AdExpense, LeadSource } from '../lib/types'
import { formatDate, formatMoney } from '../lib/format'
import { Pagination } from '../components/Pagination'
import { Modal } from '../components/Modal'
import { ConfirmModal } from '../components/ConfirmModal'
import { useToast } from '../components/Toasts'
import {
  IconAlertTriangle,
  IconChevronDown,
  IconEye,
  IconMegaphone,
  IconPencil,
  IconPlus,
  IconTrash,
} from '../components/icons'

export function LeadSourcesPage() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchName = searchParams.get('name')
  const searchId = searchParams.get('id')

  const [items, setItems] = useState<LeadSource[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const [viewing, setViewing] = useState<LeadSource | null>(null)
  const [formSource, setFormSource] = useState<LeadSource | 'new' | null>(null)
  const [expenseFor, setExpenseFor] = useState<LeadSource | null>(null)
  const [deletingSource, setDeletingSource] = useState<LeadSource | null>(null)
  const [deletingExpense, setDeletingExpense] = useState<AdExpense | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Автоматическое открытие модалки источника, если перешли по ссылке из аналитики
  useEffect(() => {
    if (!searchId && !searchName) return
    if (searchId) {
      getLeadSource(Number(searchId))
        .then((src) => setViewing(src))
        .catch(() => {})
    } else if (searchName) {
      if (items.length > 0) {
        const match = items.find((x) => x.name.toLowerCase() === searchName.toLowerCase())
        if (match) {
          setViewing(match)
          return
        }
      }
      getLeadSources(1, 100)
        .then((res) => {
          const m = res.items.find((x) => x.name.toLowerCase() === searchName.toLowerCase())
          if (m) setViewing(m)
        })
        .catch(() => {})
    }
  }, [items, searchId, searchName])

  const closeViewing = () => {
    setViewing(null)
    if (searchId || searchName) {
      setSearchParams({})
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getLeadSources(page, pageSize)
      setItems(res.items)
      setTotalCount(res.totalCount)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось загрузить источники')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    void load()
  }, [load])

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const runAction = async (fn: () => Promise<unknown>, msg: string) => {
    setBusy(true)
    try {
      await fn()
      toast('success', msg)
      setFormSource(null)
      setExpenseFor(null)
      setDeletingSource(null)
      setDeletingExpense(null)
      await load()
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Что-то пошло не так')
    } finally {
      setBusy(false)
    }
  }

  const spentOf = (s: LeadSource) => (s.adExpenses ?? []).reduce((acc, e) => acc + e.amount, 0)

  return (
    <div className="page fade-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Источники и реклама</h1>
          <div className="page-subtitle">{loading ? 'Загрузка…' : `Всего источников: ${totalCount}`}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setFormSource('new')}>
          <IconPlus size={16} />
          Добавить источник
        </button>
      </div>

      <div className="card table-card">
        <div className="table-wrap only-desktop">
          <table className="requests">
            <thead>
              <tr>
                <th style={{ width: 40 }} />
                <th>Источник</th>
                <th>Сайт</th>
                <th className="col-right">Недельный бюджет</th>
                <th className="col-right">Всего расходов</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: Math.min(pageSize, 5) }, (_, i) => (
                  <tr key={`sk-${i}`}>
                    {Array.from({ length: 7 }, (_, j) => (
                      <td key={j}>
                        <div className="skeleton" style={{ height: 14, width: `${50 + ((i * 23 + j * 17) % 45)}%` }} />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading &&
                items.map((s) => (
                  <Fragment key={s.id}>
                    <tr
                      onClick={() => setViewing(s)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setViewing(s)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => toggleExpand(s.id)}
                          title={expanded.has(s.id) ? 'Скрыть расходы' : `Расходы (${s.adExpenses?.length ?? 0})`}
                          aria-label="Показать расходы"
                        >
                          <IconChevronDown
                            size={15}
                            style={{
                              transition: 'transform .2s',
                              transform: expanded.has(s.id) ? 'rotate(180deg)' : undefined,
                            }}
                          />
                        </button>
                      </td>
                      <td className="cell-main">{s.name}</td>
                      <td>
                        {s.websiteUrl ? (
                          <a
                            href={s.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#a5b4fc', textDecoration: 'none' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {s.websiteUrl.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          <span className="faint">—</span>
                        )}
                      </td>
                      <td className="amount-cell">{formatMoney(s.targetWeeklyBudget)}</td>
                      <td className="amount-cell">{formatMoney(spentOf(s))}</td>
                      <td>
                        <span className={`badge ${s.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                          <span className="dot" />
                          {s.isActive ? 'Активен' : 'Отключён'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-ghost btn-icon"
                            title="Просмотр и расходы"
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewing(s)
                            }}
                          >
                            <IconEye size={14} />
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '6px 10px', fontSize: 12.5 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpenseFor(s)
                            }}
                          >
                            <IconPlus size={13} />
                            Расход
                          </button>
                          <button
                            className="btn btn-ghost btn-icon"
                            title="Изменить"
                            onClick={(e) => {
                              e.stopPropagation()
                              setFormSource(s)
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
                              setDeletingSource(s)
                            }}
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expanded.has(s.id) &&
                      ((s.adExpenses ?? []).length === 0 ? (
                        <tr style={{ cursor: 'default' }}>
                          <td />
                          <td colSpan={6} className="faint" style={{ padding: '10px 18px' }}>
                            Расходов пока нет — добавьте первый кнопкой «Расход».
                          </td>
                        </tr>
                      ) : (
                        s.adExpenses!.map((e) => (
                          <tr key={`${s.id}-${e.id}`} style={{ cursor: 'default', background: 'var(--surface-2)' }}>
                            <td />
                            <td colSpan={2} style={{ paddingLeft: 46 }}>
                              <span className="faint" style={{ marginRight: 10 }}>↳ расход</span>
                              <span className="cell-main" style={{ fontWeight: 500 }}>{formatDate(e.expenseStartDate)}</span>
                            </td>
                            <td className="amount-cell">{formatMoney(e.amount)}</td>
                            <td colSpan={3}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                  className="btn btn-ghost btn-icon"
                                  title="Удалить расход"
                                  style={{ color: 'var(--rose)' }}
                                  onClick={() => setDeletingExpense(e)}
                                >
                                  <IconTrash size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ))}
                  </Fragment>
                ))}
            </tbody>
          </table>
        </div>

        {/* Мобильный список карточек */}
        <div className="only-mobile">
          {loading &&
            Array.from({ length: 4 }, (_, i) => (
              <div key={`skm-${i}`} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '35%' }} />
              </div>
            ))}
          {!loading &&
            items.map((s) => (
              <div
                key={s.id}
                className="today-row"
                onClick={() => setViewing(s)}
                style={{ cursor: 'pointer' }}
              >
                <div className="tr-main">
                  <div className="tr-title">{s.name}</div>
                  <div className="tr-sub">
                    Бюджет: {formatMoney(s.targetWeeklyBudget)} / нед · Расходы: {formatMoney(spentOf(s))}
                  </div>
                  {s.websiteUrl && <div className="tr-sub faint">{s.websiteUrl.replace(/^https?:\/\//, '')}</div>}
                </div>
                <div className="tr-right">
                  <span className={`badge ${s.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                    <span className="dot" />
                    {s.isActive ? 'Активен' : 'Откл'}
                  </span>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFormSource(s)
                    }}
                    aria-label="Редактировать"
                  >
                    <IconPencil size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon"
                    style={{ color: 'var(--red)' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletingSource(s)
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
            <div className="icon-wrap"><IconMegaphone size={24} /></div>
            <h3>Источников нет</h3>
            <p>Добавьте первый источник рекламы кнопкой выше.</p>
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
        <LeadSourceDetailsModal
          source={viewing}
          onClose={closeViewing}
          onEdit={(s) => {
            closeViewing()
            setFormSource(s)
          }}
          onAddExpense={(s) => {
            setExpenseFor(s)
          }}
          onDeleteExpense={(e) => {
            setDeletingExpense(e)
          }}
        />
      )}

      {formSource && (
        <SourceFormModal
          source={formSource === 'new' ? null : formSource}
          busy={busy}
          onClose={() => setFormSource(null)}
          onSubmit={(dto) =>
            runAction(
              () =>
                formSource === 'new'
                  ? createLeadSource(dto)
                  : updateLeadSource((formSource as LeadSource).id, dto),
              formSource === 'new' ? 'Источник добавлен' : 'Источник обновлён',
            )
          }
        />
      )}

      {expenseFor && (
        <ExpenseFormModal
          sourceName={expenseFor.name}
          busy={busy}
          onClose={() => setExpenseFor(null)}
          onSubmit={(dto) => runAction(() => createAdExpense(expenseFor.id, dto), 'Расход добавлен')}
        />
      )}

      {deletingSource && (
        <ConfirmModal
          title="Удалить источник?"
          message={`Источник «${deletingSource.name}» и все его рекламные расходы будут удалены безвозвратно.`}
          busy={busy}
          onCancel={() => setDeletingSource(null)}
          onConfirm={() => runAction(() => deleteLeadSource(deletingSource.id), 'Источник удалён')}
        />
      )}

      {deletingExpense && (
        <ConfirmModal
          title="Удалить расход?"
          message={`Расход на ${formatMoney(deletingExpense.amount)} от ${formatDate(deletingExpense.expenseStartDate)} будет удалён.`}
          busy={busy}
          onCancel={() => setDeletingExpense(null)}
          onConfirm={() => runAction(() => deleteAdExpense(deletingExpense.id), 'Расход удалён')}
        />
      )}
    </div>
  )
}

/* ================= Модалка детального просмотра источника ================= */

function LeadSourceDetailsModal({
  source,
  onClose,
  onEdit,
  onAddExpense,
  onDeleteExpense,
}: {
  source: LeadSource
  onClose: () => void
  onEdit: (source: LeadSource) => void
  onAddExpense: (source: LeadSource) => void
  onDeleteExpense: (expense: AdExpense) => void
}) {
  const [detailed, setDetailed] = useState<LeadSource>(source)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDetailed(source)
    let alive = true
    getLeadSource(source.id)
      .then((d) => {
        if (alive) setDetailed(d)
      })
      .catch((e) => {
        if (alive) setError(e instanceof ApiError ? e.message : 'Не удалось загрузить данные источника')
      })
    return () => {
      alive = false
    }
  }, [source.id, source])

  const expenses = detailed.adExpenses ?? source.adExpenses ?? []
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const monthlyEstimate = Math.round(source.targetWeeklyBudget * 4.33)

  return (
    <Modal
      title={source.name}
      subtitle={source.websiteUrl ? source.websiteUrl.replace(/^https?:\/\//, '') : 'Рекламный источник'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Закрыть
          </button>
          <button className="btn btn-ghost" onClick={() => onAddExpense(detailed ?? source)}>
            <IconPlus size={14} />
            Добавить расход
          </button>
          <button className="btn btn-primary" onClick={() => onEdit(detailed ?? source)}>
            <IconPencil size={14} />
            Редактировать
          </button>
        </>
      }
    >
      <div className="client-detail-header">
        <div className="info-grid" style={{ marginBottom: 16 }}>
          <div className="info-item">
            <div className="k">Недельный бюджет</div>
            <div className="v mono-num" style={{ color: 'var(--text-primary)', fontSize: 16 }}>
              {formatMoney(source.targetWeeklyBudget)}
            </div>
          </div>
          <div className="info-item">
            <div className="k">Месячный план (~)</div>
            <div className="v mono-num">{formatMoney(monthlyEstimate)}</div>
          </div>
          <div className="info-item">
            <div className="k">Всего расходов внесено</div>
            <div className="v mono-num" style={{ color: 'var(--green)', fontSize: 16 }}>
              {formatMoney(totalSpent)}
            </div>
          </div>
          <div className="info-item">
            <div className="k">Статус активности</div>
            <div className="v">
              <span className={`badge ${source.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                <span className="dot" />
                {source.isActive ? 'Активен' : 'Отключён'}
              </span>
            </div>
          </div>
        </div>

        {source.websiteUrl && (
          <div style={{ marginBottom: 16, fontSize: 13 }}>
            <span className="faint" style={{ marginRight: 8 }}>Сайт / ссылка:</span>
            <a
              href={source.websiteUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#a5b4fc', textDecoration: 'underline' }}
            >
              {source.websiteUrl}
            </a>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-card-title" style={{ fontSize: 14, margin: 0 }}>
          История рекламных расходов ({expenses.length})
        </div>
        <button
          className="btn btn-ghost"
          style={{ padding: '4px 10px', fontSize: 12.5 }}
          onClick={() => onAddExpense(detailed ?? source)}
        >
          <IconPlus size={13} />
          Внести расход
        </button>
      </div>

      {error && (
        <div className="confirm-warning">
          <IconAlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {!error && expenses.length === 0 && (
        <div className="empty-state" style={{ padding: '24px 10px' }}>
          <div className="icon-wrap" style={{ width: 40, height: 40 }}>
            <IconMegaphone size={20} />
          </div>
          <h3>Расходов пока нет</h3>
          <p>Вносите еженедельные или разовые расходы на рекламу для расчёта ROI.</p>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="history-list">
          {expenses.map((e) => (
            <div
              key={e.id}
              className="today-row"
              style={{ borderRadius: 10, padding: '10px 14px', alignItems: 'center' }}
            >
              <div className="tr-main">
                <div className="tr-title" style={{ fontWeight: 600 }}>
                  {formatMoney(e.amount)}
                </div>
                <div className="tr-sub">
                  Период с: {formatDate(e.expenseStartDate)}
                </div>
              </div>
              <div className="tr-right">
                <button
                  className="btn btn-ghost btn-icon"
                  title="Удалить расход"
                  style={{ color: 'var(--rose)' }}
                  onClick={() => onDeleteExpense(e)}
                >
                  <IconTrash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

/* ================= форма источника ================= */

function SourceFormModal({
  source,
  busy,
  onClose,
  onSubmit,
}: {
  source: LeadSource | null
  busy: boolean
  onClose: () => void
  onSubmit: (dto: { name: string; websiteUrl: string; targetWeeklyBudget: number; isActive: boolean }) => Promise<unknown>
}) {
  const [name, setName] = useState(source?.name ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(source?.websiteUrl ?? '')
  const [budget, setBudget] = useState(String(source?.targetWeeklyBudget ?? ''))
  const [isActive, setIsActive] = useState(source?.isActive ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (name.trim().length < 2 || name.trim().length > 50) e.name = 'Название: от 2 до 50 символов'
    const url = websiteUrl.trim()
    if (url && !/^https?:\/\/.+\..+/.test(url)) e.websiteUrl = 'URL должен начинаться с http:// или https://'
    const b = Number(budget.replace(',', '.'))
    if (Number.isNaN(b) || b < 0) e.targetWeeklyBudget = 'Бюджет: число ≥ 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    setServerError(null)
    if (!validate()) return
    try {
      await onSubmit({
        name: name.trim(),
        websiteUrl: websiteUrl.trim(),
        targetWeeklyBudget: Number(budget.replace(',', '.')),
        isActive,
      })
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Не удалось сохранить')
    }
  }

  return (
    <Modal
      title={source ? `Редактирование · ${source.name}` : 'Новый источник'}
      subtitle={source ? 'Настройка названия, ссылки и недельного бюджета' : 'Откуда приходят лиды: Авито, ВК, сайт…'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Отмена</button>
          <button className="btn btn-primary" onClick={() => void submit()} disabled={busy}>
            {source ? 'Сохранить' : 'Добавить'}
          </button>
        </>
      }
    >
      {serverError && <div className="login-error" role="alert">⚠ <span>{serverError}</span></div>}
      <div className="form-grid">
        <div className="field span-2">
          <label className="label" htmlFor="ls-name">Название источника<span className="req">*</span></label>
          <input id="ls-name" className={`input ${errors.name ? 'invalid' : ''}`} placeholder="Авито" maxLength={50} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="field span-2">
          <label className="label" htmlFor="ls-url">Сайт или ссылка</label>
          <input id="ls-url" className={`input ${errors.websiteUrl ? 'invalid' : ''}`} placeholder="https://avito.ru" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
          {errors.websiteUrl && <span className="field-error">{errors.websiteUrl}</span>}
        </div>
        <div className="field span-2">
          <label className="label" htmlFor="ls-budget">Целевой недельный бюджет, ₽<span className="req">*</span></label>
          <input id="ls-budget" className={`input ${errors.targetWeeklyBudget ? 'invalid' : ''}`} inputMode="decimal" placeholder="5000" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <span className="hint">Используется для расчёта плановых затрат и ROI в аналитике</span>
          {errors.targetWeeklyBudget && <span className="field-error">{errors.targetWeeklyBudget}</span>}
        </div>
        <label className="field span-2" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
          <span className="label" style={{ margin: 0 }}>Активен (доступен для выбора при создании заявок)</span>
        </label>
      </div>
    </Modal>
  )
}

/* ================= форма расхода ================= */

function ExpenseFormModal({
  sourceName,
  busy,
  onClose,
  onSubmit,
}: {
  sourceName: string
  busy: boolean
  onClose: () => void
  onSubmit: (dto: { amount: number; expenseStartDate: string }) => Promise<unknown>
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    const a = Number(amount.replace(',', '.'))
    if (Number.isNaN(a) || a <= 0) e.amount = 'Сумма должна быть больше нуля'
    if (!date) e.expenseStartDate = 'Укажите дату'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    setServerError(null)
    if (!validate()) return
    try {
      await onSubmit({
        amount: Number(amount.replace(',', '.')),
        // полдень UTC, чтобы дата не «уехала» при конвертации таймзоны
        expenseStartDate: `${date}T12:00:00Z`,
      })
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Не удалось сохранить')
    }
  }

  return (
    <Modal
      title="Рекламный расход"
      subtitle={`Источник: ${sourceName}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Отмена</button>
          <button className="btn btn-primary" onClick={() => void submit()} disabled={busy}>Добавить</button>
        </>
      }
    >
      {serverError && <div className="login-error" role="alert">⚠ <span>{serverError}</span></div>}
      <div className="form-grid">
        <div className="field">
          <label className="label" htmlFor="ex-amount">Сумма, ₽<span className="req">*</span></label>
          <input id="ex-amount" className={`input ${errors.amount ? 'invalid' : ''}`} inputMode="decimal" placeholder="1500" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </div>
        <div className="field">
          <label className="label" htmlFor="ex-date">Дата<span className="req">*</span></label>
          <input id="ex-date" type="date" className={`input ${errors.expenseStartDate ? 'invalid' : ''}`} value={date} onChange={(e) => setDate(e.target.value)} />
          {errors.expenseStartDate && <span className="field-error">{errors.expenseStartDate}</span>}
        </div>
      </div>
    </Modal>
  )
}

