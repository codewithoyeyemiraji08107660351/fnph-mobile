import { Badge } from './Badge'
import type { AppointmentStatus } from '@/lib/api/types'

const MAP: Record<AppointmentStatus, { tone: 'green' | 'navy' | 'gold' | 'red' | 'grey'; label: string }> = {
  SLOT_HELD: { tone: 'gold', label: 'Held, awaiting payment' },
  EXPIRED: { tone: 'grey', label: 'Hold expired' },
  AWAITING_APPROVAL: { tone: 'navy', label: 'Awaiting hospital approval' },
  APPROVED: { tone: 'green', label: 'Confirmed' },
  REJECTED: { tone: 'red', label: 'Not accepted' },
  RESCHEDULED: { tone: 'grey', label: 'Rescheduled' },
  CANCELLED: { tone: 'grey', label: 'Cancelled' },
  IN_PROGRESS: { tone: 'green', label: 'In progress' },
  COMPLETED: { tone: 'grey', label: 'Completed' },
  NO_SHOW: { tone: 'red', label: 'Missed' },
}

export function AppointmentBadge({ status }: { status: AppointmentStatus }) {
  const m = MAP[status] ?? { tone: 'grey' as const, label: status }
  return <Badge tone={m.tone}>{m.label}</Badge>
}
