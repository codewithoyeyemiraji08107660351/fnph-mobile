import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { PatientExperience } from '@/features/patient/PatientExperience'
import { Spinner } from '@/components/ui/Spinner'
import { InactivityGuard } from './InactivityGuard'

/** The signed-in frame: the patient layout, the idle sign-out, and the page. */
export function PatientShell() {
  return (
    <PatientExperience>
      <InactivityGuard />
      <Suspense fallback={<Spinner label="Loading" />}>
        <Outlet />
      </Suspense>
    </PatientExperience>
  )
}
