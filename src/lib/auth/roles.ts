import type { PrincipalScope } from '@/lib/api/types'
export const PATIENT = 'PATIENT'

/** Where a patient lands after sign-in. Must match roles.dashboard_route for PATIENT on the backend. */
export const PATIENT_HOME = '/portal'

export function roleName(code?: string | null): string {
  if (!code) return ''
  return code === PATIENT ? 'Patient' : code
}

export function isPatientScope(scope?: PrincipalScope | null): boolean {
  return scope === 'PATIENT'
}

/**
  Only a known patient path is followed after sign-in. Anything else falls
  back to the patient home rather than becoming an open redirect.
*/
export function safeDashboardRoute(route?: string | null): string {
  return route === PATIENT_HOME ? route : PATIENT_HOME
}
