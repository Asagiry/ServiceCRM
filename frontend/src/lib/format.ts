const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

export function formatMoney(value?: number | null): string {
  if (value === undefined || value === null) return '—'
  return money.format(value)
}

const dateTimeFmt = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const dateFmt = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  return dateTimeFmt.format(new Date(iso))
}

export function formatDate(iso?: string): string {
  if (!iso) return '—'
  return dateFmt.format(new Date(iso))
}

/** ISO-дата (UTC) → значение для input[type=date] в локальной зоне. */
export function isoToLocalDateInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

/**
 * Нормализует номер телефона к формату +79XXXXXXXXX для бэкенда:
 * - 89201044030        -> +79201044030
 * - 79201044030        -> +79201044030
 * - 9201044030         -> +79201044030
 * - +79201044030       -> +79201044030
 * - +7 (920) 104-40-30 -> +79201044030
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) {
    return `+7${digits}`
  }
  if (digits.length === 11) {
    if (digits.startsWith('7') || digits.startsWith('8')) {
      return `+7${digits.slice(1)}`
    }
    return `+${digits}`
  }
  if (raw.trim().startsWith('+7')) {
    return `+7${digits.slice(1)}`
  }
  return raw.trim()
}

/**
 * Проверяет, является ли введенный номер валидным российским номером телефона:
 * Допускает ввод как с "+7", так и с "8", "7", или просто 10 цифр ("9XXXXXXXXX").
 */
export function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return true
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) return true
  return false
}

