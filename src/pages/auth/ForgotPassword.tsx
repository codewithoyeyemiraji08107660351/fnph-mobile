import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api/endpoints/auth'
import { toApiError } from '@/lib/api/http'
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle'
import { Alert } from '@/components/ui/Alert'
import { TextField } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { AuthCard } from './AuthCard'

/** Patient password reset: the EHR number opens a short-lived reset step. */
export function ForgotPassword() {
  useDocumentTitle('Reset your password')
  const navigate = useNavigate()

  const [ehrNumber, setEhrNumber] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!ehrNumber.trim()) return setError('Enter your EHR number.')
    setBusy(true)
    setError(null)
    try {
      const reset = await authApi.startPatientPasswordReset(ehrNumber)
      navigate(`/reset-password?from=patient&token=${encodeURIComponent(reset.token)}`)
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard>
      <form onSubmit={submit} noValidate>
        <h1 className="text-2xl font-extrabold">Reset your password</h1>
        <p className="mt-2 text-sm text-muted">
          Enter the EHR number on your hospital card. If it matches an active patient account, you can choose a new password immediately.
        </p>
        {error && (
          <Alert tone="danger" className="mt-4">
            {error}
          </Alert>
        )}
        <TextField
          wrapperClassName="mt-5"
          label="EHR number"
          value={ehrNumber}
          onChange={(e) => setEhrNumber(e.target.value)}
          autoComplete="username"
          inputMode="numeric"
          autoCapitalize="none"
          spellCheck={false}
          required
        />
        <button className="btn btn-primary mt-6 w-full" type="submit" disabled={busy}>
          {busy ? <Spinner label="Checking" inverted /> : 'Continue to reset password'}
        </button>
        <Link to="/patients" className="mt-4 block text-center text-sm font-bold">
          Back to sign in
        </Link>
      </form>
    </AuthCard>
  )
}
