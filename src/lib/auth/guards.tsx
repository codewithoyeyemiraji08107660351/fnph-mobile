import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { PATIENT_HOME, isPatientScope } from './roles'
import { FullPageLoader } from '@/components/ui/Spinner'

/*
  These guards decide what the app shows. They are not the security
  boundary: the API checks every permission on every request.
*/

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, principal } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <FullPageLoader label="Restoring your session" />
  if (status === 'anonymous' || !principal) {
    return <Navigate to="/patients" replace state={{ from: location.pathname }} />
  }
  if (principal.mustChangePassword && location.pathname !== '/account/password') {
    return <Navigate to="/account/password" replace />
  }
  return <>{children}</>
}

export function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { principal, hasRole } = useAuth()
  if (!principal) return null
  if (hasRole(...roles)) return <>{children}</>
  return <Navigate to="/" replace />
}

export function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { can, principal } = useAuth()
  if (!principal) return null
  if (can(permission)) return <>{children}</>
  return <Navigate to={PATIENT_HOME} replace />
}

/** Sign-in and enrolment screens: a patient who is already signed in goes straight to their care. */
export function SignedOutOnly({ children }: { children: ReactNode }) {
  const { status, principal } = useAuth()
  if (status === 'loading') return <FullPageLoader label="Restoring your session" />
  if (isPatientScope(principal?.scope)) return <Navigate to={PATIENT_HOME} replace />
  return <>{children}</>
}

/**
  The app is for patients only. Staff accounts sign in on the website, where
  their workspaces are. A staff account that signs in here is told so and
  offered sign-out, rather than shown an empty patient screen.
*/
export function PatientOnly({ children }: { children: ReactNode }) {
  const { principal, signOut } = useAuth()
  if (principal && !isPatientScope(principal.scope)) {
    // Not the patient layout: it loads the signed-in patient's own records,
    // which a staff account cannot read.
    return (
      <main className="flex min-h-dvh items-center justify-center bg-canvas p-6">
        <div className="card max-w-md space-y-3 p-6">
          <span className="eyebrow">Patient app</span>
          <h1 className="text-xl font-extrabold">This app is for patients</h1>
          <p className="text-sm text-muted">Hospital and centre staff sign in on the FNPH Kaduna telepsychiatry website.</p>
          <button type="button" className="btn btn-primary" onClick={() => void signOut()}>Sign out</button>
        </div>
      </main>
    )
  }
  return <>{children}</>
}
