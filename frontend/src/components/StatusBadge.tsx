import type { RequestStatus } from '../lib/types'
import { STATUS_LABELS } from '../lib/types'

const BADGE_CLASS: Record<RequestStatus, string> = {
  New: 'badge-new',
  Assigned: 'badge-assigned',
  InProgress: 'badge-inprogress',
  Completed: 'badge-completed',
  Cancelled: 'badge-cancelled',
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`badge ${BADGE_CLASS[status]}`}>
      <span className="dot" />
      {STATUS_LABELS[status]}
    </span>
  )
}
