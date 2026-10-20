import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { RouteError } from '@/components/layout/RouteError'
import { PatientShell } from '@/components/layout/PatientShell'
import { PatientOnly, RequireAuth, SignedOutOnly } from '@/lib/auth/guards'
import { PatientExperience } from '@/features/patient/PatientExperience'
import { PatientEntrance } from '@/pages/public/PatientEntrance'
import { Enrol } from '@/pages/public/Enrol'
import { Help } from '@/pages/public/Help'
import { Privacy } from '@/pages/public/Privacy'
import { AccountDeletion } from '@/pages/public/AccountDeletion'
import { Account } from '@/pages/account/Account'
import { VerifyDocument } from '@/pages/public/VerifyDocument'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import { ResetPassword } from '@/pages/auth/ResetPassword'
import { ForcedPasswordChange } from '@/pages/account/ForcedPasswordChange'
import { patientPortalRoute } from './portalRoutes'
import { NativeShell } from './NativeShell'

/*
  The app's routes.

  Before sign-in: sign-in, enrolment, password reset, help, privacy and
  document checks, in the patient design. After sign-in: the patient portal
  under /portal and the account screens. Paths match the FNPH website's
  patient pages, so links in emails and from Remita open the same screen.
  Anything else returns to the start, which is sign-in or, once signed in,
  the patient's dashboard.
*/

const signIn = (
  <SignedOutOnly>
    <PatientEntrance />
  </SignedOutOnly>
)

export const appRouter = createBrowserRouter([
  {
    element: <NativeShell />,
    errorElement: <RouteError />,
    children: [
      {
        element: (
          <PatientExperience>
            <Outlet />
          </PatientExperience>
        ),
        children: [
          { index: true, element: signIn },
          { path: 'patients', element: signIn },
          { path: 'sign-in', element: signIn },
          { path: 'enrol', element: <SignedOutOnly><Enrol /></SignedOutOnly> },
          { path: 'forgot-password', element: <ForgotPassword /> },
          { path: 'reset-password', element: <ResetPassword /> },
          { path: 'help', element: <Help /> },
          { path: 'privacy', element: <Privacy /> },
          { path: 'account-deletion', element: <AccountDeletion /> },
          { path: 'verify', element: <VerifyDocument /> },
          { path: 'verify/:token', element: <VerifyDocument /> },
        ],
      },
      {
        element: (
          <RequireAuth>
            <PatientOnly>
              <PatientShell />
            </PatientOnly>
          </RequireAuth>
        ),
        children: [
          { path: 'home', element: <Navigate to="/portal" replace /> },
          // My profile links here for password and signed-in devices.
          { path: 'account', element: <Account /> },
          { path: 'account/password', element: <ForcedPasswordChange /> },
          patientPortalRoute,
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
