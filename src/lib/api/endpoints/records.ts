import { api, http, seg } from '../http'
import type { Page } from '../types'

/* ---------------- consent and triage versions ---------------- */
/* ---------------- appointment lifecycle ---------------- */
export const lifecycleApi = {
  /** Query parameters. A request, decided by the hub. */
  requestChange: (appointmentId: string, p: { requestType: 'CANCEL' | 'RESCHEDULE'; reason: string; proposedSlotPublicId?: string }) =>
    api.post<{ publicId: string; hoursNotice: number; requiredNoticeHours: number; withinNoticePeriod: boolean; status: string }>(
      `/appointments/${seg(appointmentId)}/cancel-request`, null, { params: p }),
  /** Moves straight away and goes back to the hub for a new doctor and room. */
  reschedule: (appointmentId: string, newSlotPublicId: string, reason: string) =>
    api.post<{ reference: string; newTime: string; status: string }>(`/appointments/${seg(appointmentId)}/reschedule`, null, { params: { newSlotPublicId, reason } })
}

/* ---------------- patient records and manual enrolment ---------------- */

export interface PatientRecord {
  publicId: string
  ehrNumber: string
  firstName: string
  lastName: string
  phoneNumber?: string
  email?: string
  isActive: boolean
  activatedAt?: string
  driftFlagged?: boolean
  eligibilityVerifiedBy?: string
  eligibilityVerifiedAt?: string
  driftDetails?: string
}

export const patientRecordsApi = {
  me: () => api.get<PatientRecord>('/patients/me'),
  get: (id: string) => api.get<PatientRecord>(`/patients/${seg(id)}`)
}

/* ---------------- uploads ---------------- */

export type FileCategory = 'VITALS_EVIDENCE' | 'LABORATORY_RESULT' | 'SUPPORTING_DOCUMENT' | 'REFERRAL_ATTACHMENT' | 'OTHER'

export interface UploadRow {
  publicId: string
  originalFileName: string
  contentType: string
  sizeBytes: number
  category: string
  scanStatus: string
  description?: string
  uploadedBy: string
  uploadedAt: string
}

export const uploadsApi = {
  upload: (file: File, category: FileCategory, description?: string, referenceId?: string) => {
    const form = new FormData()
    form.append('file', file)
    return http.post<UploadRow>('/uploads', form, { params: { category, description, referenceId }, timeout: 120_000 }).then((r) => r.data)
  },
  mine: () => api.list<UploadRow>('/uploads/mine'),
  /** Always an attachment; never rendered in the page. */
  download: async (id: string) => {
    const r = await http.get<Blob>(`/uploads/${seg(id)}/content`, { responseType: 'blob', timeout: 120_000 })
    const name = /filename="?([^";]+)"?/.exec(String(r.headers['content-disposition'] ?? ''))?.[1] ?? 'file'
    return { blob: r.data, filename: name }
  },
  remove: (id: string, reason: string) => api.delete<void>(`/uploads/${seg(id)}`, { params: { reason } })
}
/* ---------------- documents, follow-ups, triage history, recording ---------------- */

/** A follow-up the doctor recommended. Schedule fields are absent from older servers. */
export interface MyFollowUp {
  publicId: string
  recommendation: string
  reviewInterval?: string | null
  expectedTimeframe?: string | null
  preferredDate?: string | null
  preferredTime?: string | null
  consultationMode?: string | null
  status?: 'NOT_REQUIRED' | 'RECOMMENDED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | null
  scheduledDate?: string | null
  completedDate?: string | null
  createdAt: string
}

export const followUpsApi = {
  mine: () => api.list<MyFollowUp>('/clinical/follow-ups/mine')
}
export type { Page }
