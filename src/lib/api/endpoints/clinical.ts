import { api, seg } from '../http'
import type {
  JoinResponse,
  TerminationReason
} from '../types'
export type ConsultKind = 'fnph' | 'centre'

const roomBase = (kind: ConsultKind) => (kind === 'centre' ? '/centre-consultations' : '/consultations')

export const consultationApiFor = (kind: ConsultKind) => ({
  /** Creates the room on first call. A state change, never a retry target. */
  joinAsDoctor: (appointmentPublicId: string) => api.post<JoinResponse>(`${roomBase(kind)}/${seg(appointmentPublicId)}/join/doctor`),
  joinAsPatient: (appointmentPublicId: string) => api.post<JoinResponse>(`/consultations/${seg(appointmentPublicId)}/join/patient`),
  /** Centre staff attend with the patient; they are a participant, not the owner. */
  joinAsCentre: (appointmentPublicId: string) => api.post<JoinResponse>(`/centre-consultations/${seg(appointmentPublicId)}/join/centre`),
  confirmIdentity: (consultationPublicId: string) => api.post<void>(`${roomBase(kind)}/${seg(consultationPublicId)}/identity-confirmed`),
  switchModality: (consultationPublicId: string, modality: 'VIDEO' | 'AUDIO' | 'PHONE_FALLBACK', reason?: string) =>
    api.post<void>(`${roomBase(kind)}/${seg(consultationPublicId)}/modality`, null, { params: { modality, reason } }),
  terminate: (consultationPublicId: string, body: { reason: TerminationReason; note?: string; safetyAction: string }) =>
    api.post<void>(`${roomBase(kind)}/${seg(consultationPublicId)}/terminate`, body),
  /** FNPH consultations only. Fire and forget; a failed report must never disturb the session. */
  reportQuality: (consultationPublicId: string, role: 'DOCTOR' | 'PATIENT', metrics: { roundTripMs?: number; videoQuality?: string }) =>
    api.post<void>(`/consultations/${seg(consultationPublicId)}/quality`, null, { params: { role, ...metrics } }).catch(() => undefined),
})

export const consultationApi = consultationApiFor('fnph')
