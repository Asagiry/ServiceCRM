import { IconArrowLeft } from './icons'

interface PaginationProps {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  disabled?: boolean
}

function pageNumbers(current: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages = new Set<number>([1, totalPages, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  const result: (number | '…')[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) result.push('…')
    result.push(p)
    prev = p
  }
  return result
}

export function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  disabled,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  return (
    <div className="pagination">
      <span className="page-info mono-num">
        Показано {from}–{to} из {totalCount}
      </span>

      <select
        className="select page-size-select"
        value={pageSize}
        disabled={disabled}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        aria-label="Строк на странице"
      >
        {[10, 20, 50].map((n) => (
          <option key={n} value={n}>
            {n} / стр.
          </option>
        ))}
      </select>

      <button
        className="page-btn"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Предыдущая страница"
      >
        <IconArrowLeft size={15} />
      </button>

      {pageNumbers(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`dots-${i}`} className="page-ellipsis">
            …
          </span>
        ) : (
          <button
            key={p}
            className={`page-btn ${p === page ? 'current' : ''}`}
            disabled={disabled}
            onClick={() => p !== page && onPageChange(p)}
          >
            {p}
          </button>
        ),
      )}

      <button
        className="page-btn"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Следующая страница"
      >
        <IconArrowLeft size={15} style={{ transform: 'rotate(180deg)' }} />
      </button>
    </div>
  )
}
