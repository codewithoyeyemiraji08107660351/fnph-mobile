import { api } from '../http'

export type TicketCategory = 'ACCESS_AND_SIGN_IN' | 'ENROLMENT' | 'BOOKING' | 'PAYMENT' | 'TECHNICAL_FAULT' | 'DOCUMENT_ACCESS' | 'CLINICAL_CONCERN' | 'OTHER'

/** helpdesk/api/TicketResponse */
export interface Ticket {
  publicId: string
  ticketNumber: string
  category: TicketCategory
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  status: 'OPEN' | 'IN_PROGRESS' | 'AWAITING_REQUESTER' | 'ESCALATED' | 'RESOLVED' | 'CLOSED'
  subject: string
  escalatedToRole?: string
  firstResponseMinutes?: number
  resolutionSummary?: string
  createdAt: string
  messages: Array<{ author: string; body: string; internal: boolean; sentAt: string }>
}

export const supportApi = {
  raise: (body: { category: TicketCategory; subject: string; body: string; appointmentReference?: string; paymentReference?: string; documentNumber?: string }) =>
    api.post<Ticket>('/support/tickets', body)
}
