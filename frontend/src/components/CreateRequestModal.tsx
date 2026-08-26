import { useEffect, useMemo, useState } from 'react'
import { ApiError, createClient, getAllClients, getAllLeadSources } from '../lib/api'
import type { Client, LeadSource } from '../lib/types'
import { isValidPhone, normalizePhone } from '../lib/format'
import { Modal } from './Modal'
import { IconPlus, IconSearch, IconUser } from './icons'

interface CreateRequestModalProps {
  busy: boolean
  initialClientId?: number
  onClose: () => void
  onCreated: () => void
  onSubmit: (dto: {
    clientId: number
    city: string
    address: string
    leadSourceId: number
    problemDescription: string
    equipmentType: string
    scheduledAt?: string
  }) => Promise<unknown>
}

/** Город по умолчанию — подставляется подсказкой и в автозаполнение. */
const DEFAULT_CITY = 'Ярославль'

const EQUIPMENT_SUGGESTIONS = [
  'Холодильник',
  'Стиральная машина',
  'Телевизор',
  'Посудомоечная машина',
  'Духовка',
  'Плита',
  'Кондиционер',
  'Микроволновка',
  'Пылесос',
]

export function CreateRequestModal({ busy, initialClientId, onClose, onCreated, onSubmit }: CreateRequestModalProps) {
  const [clients, setClients] = useState<Client[] | null>(null)
  const [sources, setSources] = useState<LeadSource[] | null>(null)

  const [clientMode, setClientMode] = useState<'existing' | 'new'>(initialClientId ? 'existing' : 'existing')
  const [clientSearch, setClientSearch] = useState('')
  const [clientId, setClientId] = useState<string>(initialClientId ? String(initialClientId) : '')

  // Поля нового клиента
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [newClientCity, setNewClientCity] = useState('')

  // Поля заявки
  const [leadSourceId, setLeadSourceId] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [equipmentType, setEquipmentType] = useState('')
  const [problemDescription, setProblemDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([getAllClients(), getAllLeadSources()])
      .then(([c, s]) => {
        if (!alive) return
        setClients(c)
        setSources(s)
        if (initialClientId) {
          const found = c.find((cl) => cl.id === initialClientId)
          if (found && found.city) setCity(found.city)
        }
      })
      .catch((e) => alive && setServerError(e instanceof ApiError ? e.message : 'Не удалось загрузить справочники'))
    return () => {
      alive = false
    }
  }, [initialClientId])

  const filteredClients = useMemo(() => {
    if (!clients) return []
    if (!clientSearch.trim()) return clients
    const q = clientSearch.toLowerCase().trim()
    return clients.filter(
      (c) => c.fullName.toLowerCase().includes(q) || c.phoneNumber.includes(q) || (c.city && c.city.toLowerCase().includes(q)),
    )
  }, [clients, clientSearch])

  /** Города для автозаполнения: дефолтный + города клиентов из базы. */
  const citySuggestions = useMemo(() => {
    const set = new Set<string>([DEFAULT_CITY])
    for (const c of clients ?? []) if (c.city) set.add(c.city)
    return Array.from(set)
  }, [clients])

  const handleSelectClient = (id: string) => {
    setClientId(id)
    if (id && clients) {
      const selected = clients.find((c) => c.id === Number(id))
      if (selected?.city && !city) {
        setCity(selected.city)
      }
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}

    if (clientMode === 'existing') {
      if (!clientId) e.clientId = 'Выберите клиента из списка'
    } else {
      if (newClientName.trim().length < 10 || newClientName.trim().length > 100) {
        e.newClientName = 'ФИО: от 10 до 100 символов (например: Иванов Иван Иванович)'
      }
      if (!isValidPhone(newClientPhone)) {
        e.newClientPhone = 'Введите корректный телефон (например: 89001234567 или +79001234567)'
      }
      if (newClientCity.trim().length < 2 || newClientCity.trim().length > 25) {
        e.newClientCity = 'Город клиента: от 2 до 25 символов'
      }
    }

    if (!leadSourceId) e.leadSourceId = 'Выберите источник лида'
    if (city.trim().length < 2 || city.trim().length > 25) e.city = 'Город: от 2 до 25 символов'
    if (address.trim().length < 5 || address.trim().length > 100) e.address = 'Адрес: от 5 до 100 символов'
    if (equipmentType.trim().length < 1 || equipmentType.trim().length > 25) e.equipmentType = 'Тип техники: до 25 символов'
    if (problemDescription.trim().length < 1 || problemDescription.trim().length > 500) {
      e.problemDescription = 'Описание: от 1 до 500 символов'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    setServerError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      let finalClientId: number

      if (clientMode === 'new') {
        const createdClient = await createClient({
          fullName: newClientName.trim(),
          phoneNumber: normalizePhone(newClientPhone),
          city: newClientCity.trim(),
        })
        finalClientId = createdClient.id
      } else {
        finalClientId = Number(clientId)
      }

      await onSubmit({
        clientId: finalClientId,
        leadSourceId: Number(leadSourceId),
        city: city.trim(),
        address: address.trim(),
        equipmentType: equipmentType.trim(),
        problemDescription: problemDescription.trim(),
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      })
      onCreated()
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Не удалось создать заявку')
    } finally {
      setSubmitting(false)
    }
  }

  const loadingRefs = clients === null || sources === null
  const isBusy = busy || submitting

  return (
    <Modal
      title="Новая заявка"
      subtitle="Заявка будет создана со статусом «Новая»"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={isBusy}>
            Отмена
          </button>
          <button className="btn btn-primary" onClick={() => void submit()} disabled={isBusy || loadingRefs}>
            {isBusy ? 'Создание…' : 'Создать заявку'}
          </button>
        </>
      }
    >
      {serverError && (
        <div className="login-error" role="alert">
          ⚠ <span>{serverError}</span>
        </div>
      )}

      {loadingRefs && !serverError ? (
        <div className="actions-stack">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton" style={{ height: 46 }} />
          ))}
        </div>
      ) : (
        <div className="form-grid">
          {/* Секция выбора/создания клиента */}
          <div className="field span-2">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="label" style={{ margin: 0 }}>
                Клиент<span className="req">*</span>
              </label>
              <div className="tab-group" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={clientMode === 'existing'}
                  className={`tab-btn ${clientMode === 'existing' ? 'active' : ''}`}
                  onClick={() => {
                    setClientMode('existing')
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.newClientName
                      delete next.newClientPhone
                      delete next.newClientCity
                      return next
                    })
                  }}
                >
                  <IconUser size={13} />
                  Из базы ({clients?.length ?? 0})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={clientMode === 'new'}
                  className={`tab-btn ${clientMode === 'new' ? 'active' : ''}`}
                  onClick={() => {
                    setClientMode('new')
                    if (newClientCity && !city) setCity(newClientCity)
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.clientId
                      return next
                    })
                  }}
                >
                  <IconPlus size={13} />
                  Новый клиент
                </button>
              </div>
            </div>

            {clientMode === 'existing' ? (
              <div>
                {(clients?.length ?? 0) > 8 && (
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <input
                      className="input"
                      style={{ paddingLeft: 32, fontSize: 13 }}
                      placeholder="Быстрый поиск клиента…"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                    />
                    <IconSearch size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-faint)' }} />
                  </div>
                )}
                <select
                  id="nr-client"
                  className={`select ${errors.clientId ? 'invalid' : ''}`}
                  value={clientId}
                  onChange={(e) => handleSelectClient(e.target.value)}
                  autoFocus
                >
                  <option value="">— выберите клиента —</option>
                  {filteredClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} · {c.phoneNumber} {c.city ? `(${c.city})` : ''}
                    </option>
                  ))}
                </select>
                {errors.clientId && <span className="field-error">{errors.clientId}</span>}
                {clients !== null && clients.length === 0 && (
                  <span className="hint">В базе пока нет клиентов. Переключитесь на «Новый клиент».</span>
                )}
              </div>
            ) : (
              <div className="client-inline-card">
                <div className="form-grid" style={{ gap: 10 }}>
                  <div className="field span-2">
                    <label className="label" htmlFor="nc-name">
                      ФИО клиента<span className="req">*</span>
                    </label>
                    <input
                      id="nc-name"
                      className={`input ${errors.newClientName ? 'invalid' : ''}`}
                      placeholder="Иванов Иван Иванович"
                      maxLength={100}
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      autoFocus
                    />
                    {errors.newClientName && <span className="field-error">{errors.newClientName}</span>}
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="nc-phone">
                      Телефон<span className="req">*</span>
                    </label>
                    <input
                      id="nc-phone"
                      className={`input ${errors.newClientPhone ? 'invalid' : ''}`}
                      placeholder="89001234567"
                      maxLength={18}
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                    />
                    {errors.newClientPhone && <span className="field-error">{errors.newClientPhone}</span>}
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="nc-city">
                      Город клиента<span className="req">*</span>
                    </label>
                    <input
                      id="nc-city"
                      className={`input ${errors.newClientCity ? 'invalid' : ''}`}
                      placeholder={DEFAULT_CITY}
                      list="city-options"
                      maxLength={25}
                      value={newClientCity}
                      onChange={(e) => {
                        setNewClientCity(e.target.value)
                        if (!city) setCity(e.target.value)
                      }}
                    />
                    {errors.newClientCity && <span className="field-error">{errors.newClientCity}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Источник лида */}
          <div className="field span-2">
            <label className="label" htmlFor="nr-source">
              Источник лида<span className="req">*</span>
            </label>
            <select
              id="nr-source"
              className={`select ${errors.leadSourceId ? 'invalid' : ''}`}
              value={leadSourceId}
              onChange={(e) => setLeadSourceId(e.target.value)}
            >
              <option value="">— выберите источник рекламы —</option>
              {sources?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.leadSourceId && <span className="field-error">{errors.leadSourceId}</span>}
          </div>

          {/* Город и Тип техники */}
          <div className="field">
            <label className="label" htmlFor="nr-city">
              Город выезда<span className="req">*</span>
            </label>
            <input
              id="nr-city"
              className={`input ${errors.city ? 'invalid' : ''}`}
              placeholder={DEFAULT_CITY}
              list="city-options"
              maxLength={25}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            {errors.city && <span className="field-error">{errors.city}</span>}
          </div>

          <div className="field">
            <label className="label" htmlFor="nr-equipment">
              Тип техники<span className="req">*</span>
            </label>
            <input
              id="nr-equipment"
              className={`input ${errors.equipmentType ? 'invalid' : ''}`}
              placeholder="Холодильник, TV, Стиральная машина…"
              list="equipment-options"
              maxLength={25}
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
            />
            {errors.equipmentType && <span className="field-error">{errors.equipmentType}</span>}
          </div>

          {/* Адрес */}
          <div className="field span-2">
            <label className="label" htmlFor="nr-address">
              Адрес выезда<span className="req">*</span>
            </label>
            <input
              id="nr-address"
              className={`input ${errors.address ? 'invalid' : ''}`}
              placeholder="ул. Ленина, д. 10, кв. 25"
              maxLength={100}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          {/* Описание проблемы */}
          <div className="field span-2">
            <label className="label" htmlFor="nr-problem">
              Описание проблемы<span className="req">*</span>
            </label>
            <textarea
              id="nr-problem"
              className={`input ${errors.problemDescription ? 'invalid' : ''}`}
              placeholder="Не включается, шумит при работе…"
              maxLength={500}
              rows={3}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
            />
            <span className="hint mono-num">{problemDescription.length}/500</span>
            {errors.problemDescription && <span className="field-error">{errors.problemDescription}</span>}
          </div>

          {/* Плановое время выезда */}
          <div className="field span-2">
            <label className="label" htmlFor="nr-scheduled">
              Плановое время выезда мастера
            </label>
            <input
              id="nr-scheduled"
              type="datetime-local"
              className="input"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <span className="hint">Необязательно (если выезд не согласован на точное время)</span>
          </div>
        </div>
      )}

      <datalist id="city-options">
        {citySuggestions.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <datalist id="equipment-options">
        {EQUIPMENT_SUGGESTIONS.map((e) => (
          <option key={e} value={e} />
        ))}
      </datalist>
    </Modal>
  )
}
