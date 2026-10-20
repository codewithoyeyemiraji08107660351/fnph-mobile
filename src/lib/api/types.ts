/*
  Shapes returned by fnph-telepsychiatric. Each type names the Java class it
  mirrors so a backend change can be traced here. Timestamps arrive as ISO
  strings; parse them with lib/format.ts, never with new Date() directly.
*/

export type IsoDateTime = string

/** handler/ErrorResponse */
export interface ErrorResponse {
  timestamp?: IsoDateTime
  status: number
  error?: string
  message?: string
  path?: string
  validationErrors?: Record<string, string>
}

/** session/api/LoginResponse */
export type LoginStatus = 'AUTHENTICATED' | 'MFA_REQUIRED' | 'MFA_ENROLMENT_REQUIRED'
export interface LoginResponse {
  status: LoginStatus
  accessToken?: string
  refreshToken?: string
  expiresInSeconds?: number
  mfaToken?: string
  mfaExpiresInSeconds?: number
  dashboardRoute?: string
  primaryRole?: string
  mustChangePassword?: boolean
  recoveryCodes?: string[]
}

/** session/api/MfaEnrolmentResponse */
export interface MfaEnrolmentResponse {
  secret: string
  provisioningUri: string
  recoveryCodes?: string[]
}

/** session/api/SessionResponse */
export interface SessionItem {
  publicId: string
  deviceLabel?: string
  ipAddress?: string
  userAgent?: string
  signedInAt: IsoDateTime
  lastSeenAt?: IsoDateTime
  expiresAt?: IsoDateTime
  current: boolean
}

export type PrincipalScope = 'FNPH' | 'PATIENT' | 'CENTRE'

/** authz/api/CurrentPrincipalResponse */
export interface Principal {
  publicId: string
  username: string
  displayName: string
  scope: PrincipalScope
  primaryRole: string
  dashboardRoute: string
  roles: string[]
  permissions: string[]
  centrePublicId?: string
  centreName?: string
  mfaEnabled: boolean
  mustChangePassword: boolean
}

/** SelfServiceController#profile (map) */
export interface OwnProfile {
  publicId: string
  username: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  mfaEnabled?: boolean
  mustChangePassword?: boolean
  lastLoginAt?: IsoDateTime
}

/** PublicInfoController#settings */
export interface PublicSettings {
  clinical_emergency_number?: string
  helpdesk_email?: string
  consultation_fee_ngn?: string
  session_minutes_fnph?: string
  joining_grace_minutes?: string
  no_show_cutoff_minutes?: string
  cancellation_notice_hours?: string
  prescription_validity_days?: string
  session_inactivity_timeout_minutes?: string
}

/** notification/api/NotificationResponse */
export interface NotificationItem {
  publicId: string
  type: string
  subject: string
  body?: string
  actionUrl?: string
  entityType?: string
  entityId?: number
  sharedWithRole: boolean
  targetRole?: string
  read: boolean
  acknowledgedBy?: string
  createdAt: IsoDateTime
}

/** document/api/VerificationResponse */
export type DocumentVerificationStatus = 'VALID' | 'EXPIRED' | 'REVOKED' | 'SUPERSEDED' | 'NOT_FOUND'
export interface DocumentVerification {
  status: DocumentVerificationStatus
  issueNumber?: string
  documentType?: string
  issuedOn?: string
  expiresOn?: string
}

/** Spring Data Page serialised by Boot 3.3 */
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

/* ------------------------------------------------------------------
   Phase 2: FNPH patient pathway
   ------------------------------------------------------------------ */

export type Money = string | number

/** ehr/api/EnrolmentLookupResponse */
export interface EnrolmentLookup {
  verificationPublicId: string
  ehrNumber: string
  fullName: string
  dateOfBirthMasked?: string | null
  clinic?: string | null
  setupExpiresAt: IsoDateTime
  recordsAsAt: string
  recordsAgeInDays: number
}

/** TriageController#currentConsent */
export interface ConsentDocumentView {
  version: string
  title: string
  body: string
}

/** TriageController#questions */
export interface TriageQuestionSet {
  version: string
  questions: Array<{ publicId: string; sequence: number; questionText: string }>
}

/** TriageController#submit. Answers are YES or NO; the server knows which one stops. */
export interface TriageResult {
  publicId: string
  outcome: 'PROCEED' | 'STOPPED' | string
  mayProceed: boolean
  stopReason?: string
  escalation?: string
}

/** ScheduleDtos.AvailableTimeResponse */
export interface AvailableTime {
  startAt: IsoDateTime
  endAt: IsoDateTime
  slotPublicId: string
  remaining: number
}

export type AppointmentStatus =
  | 'SLOT_HELD' | 'EXPIRED' | 'AWAITING_APPROVAL' | 'APPROVED' | 'REJECTED'
  | 'RESCHEDULED' | 'CANCELLED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW'

/** ScheduleDtos.AppointmentResponse */
export interface Appointment {
  publicId: string
  reference: string
  status: AppointmentStatus
  appointmentDate: IsoDateTime
  scheduledEndAt: IsoDateTime
  heldUntil?: IsoDateTime
  room?: string
  joinWindowOpensAt?: IsoDateTime
  rejectedReason?: string
}

/** ScheduleDtos.HistoryResponse */
export interface AppointmentHistory {
  fromStatus?: string
  toStatus: string
  changedBy?: string
  changedAt: IsoDateTime
  reason?: string
}

/** payment/api/PaymentResponse */
export interface PaymentView {
  publicId: string
  reference: string
  rrr?: string | null
  paymentLink?: string | null
  status: string
  amount: string
  creditApplied: string
  payableAmount: string
  currency: string
  initiatedAt: string
  verifiedAt?: string | null
  expiresAt: string
  failureReason?: string | null
  amountMismatch: boolean
  usedForBooking: boolean
}

/** payment/api/CreditBalanceResponse */
export interface CreditBalance {
  balance: Money
  currency: string
}

/** VitalsController.VitalsRequest */
export interface VitalsInput {
  systolic?: number
  diastolic?: number
  heartRate?: number
  respiratoryRate?: number
  temperature?: number
  weightKg?: number
  heightCm?: number
  bloodOxygen?: number
  bloodGlucose?: number
  measuredAt?: string
  measurementSource?: string
  notes?: string
}

/** consultation/api/JoinConsultationResponse */
export interface JoinResponse {
  consultationPublicId: string
  roomUrl: string
  token: string
  scheduledStart: IsoDateTime
  scheduledEnd: IsoDateTime
  remainingSeconds: number
  firstWarningMinutes: number
  secondWarningMinutes: number
  isOwner: boolean
}

export type TerminationReason =
  | 'FAILED_IDENTITY_VERIFICATION' | 'UNACCEPTABLE_PRIVACY' | 'PERSISTENT_DISRUPTION'
  | 'ABUSE' | 'EMERGENCY' | 'ACUTE_CLINICAL_UNSUITABILITY' | 'UNSAFE_CONNECTIVITY' | 'OTHER'

export interface PrescriptionItem {
  medication: string
  strength: string
  frequency: string
  duration: string
  instructions?: string
}

/** ClinicalReadController#prescriptionRow */
export interface PrescriptionDetail {
  publicId: string
  issueNumber?: string
  status: string
  issueDate: string
  expiryDate?: string
  clinicalInformation?: string
  items: PrescriptionItem[]
}

/** ClinicalReadController#investigationRow */
export interface InvestigationDetail {
  publicId: string
  issueNumber?: string
  status: string
  issueDate: string
  expiryDate?: string
  clinicalInformation?: string
  panels: Array<{ panelName: string; panelCode?: string }>
}

/** document/api/DocumentResponse */
export interface IssuedDocument {
  publicId: string
  issueNumber?: string
  documentType: string
  status: string
  issuedAt?: IsoDateTime
  expiresAt?: IsoDateTime
  downloadCount: number
  maxDownloads: number
  viewOnly: boolean
  verificationUrl?: string
  revokedReason?: string
}

/* ------------------------------------------------------------------
   Phase 3: Centres of Excellence
   ------------------------------------------------------------------ */

/** TriageController#mine. Newest response is first. */
export interface TriageHistoryItem {
  publicId: string
  version: string
  outcome: 'PROCEED' | 'STOPPED' | string
  stopReason?: string
  escalation?: string
  submittedAt: IsoDateTime
}
