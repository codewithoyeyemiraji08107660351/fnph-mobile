import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api/endpoints/auth'
import { SESSION_EXPIRED, refreshSession, sessionEvents, tokenStore, toApiError } from '@/lib/api/http'
import type { LoginResponse, Principal } from '@/lib/api/types'

type Status = 'loading' | 'anonymous' | 'authenticated'

interface AuthContextValue {
  status: Status
  principal: Principal | null
  /** Why the last session ended, shown once on the sign-in page. */
  endedReason: string | null
  clearEndedReason: () => void
  can: (permission: string) => boolean
  hasRole: (...codes: string[]) => boolean
  /** Stores tokens from a completed sign-in step and loads the principal. */
  completeSignIn: (response: LoginResponse) => Promise<Principal>
  signOut: (reason?: string) => Promise<void>
  reloadPrincipal: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<Status>(() => (tokenStore.hasRefreshToken() ? 'loading' : 'anonymous'))
  const [principal, setPrincipal] = useState<Principal | null>(null)
  const [endedReason, setEndedReason] = useState<string | null>(null)
  const bootstrapped = useRef(false)

  const resetLocal = useCallback(
    (reason: string | null) => {
      tokenStore.clear()
      setPrincipal(null)
      setStatus('anonymous')
      setEndedReason(reason)
      queryClient.clear()
    },
    [queryClient],
  )

  const loadPrincipal = useCallback(async () => {
    const me = await authApi.me()
    setPrincipal(me)
    setStatus('authenticated')
    return me
  }, [])

  // Restore a session after a reload.
  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    if (!tokenStore.hasRefreshToken()) return
    refreshSession()
      .then(loadPrincipal)
      .catch((err) => {
        const e = toApiError(err)
        resetLocal(e.isNetworkError ? 'The service could not be reached, so you were signed out. Sign in again when your connection returns.' : null)
      })
  }, [loadPrincipal, resetLocal])

  useEffect(() => {
    const onExpired = () => resetLocal('Your session ended. Sign in again to continue.')
    sessionEvents.addEventListener(SESSION_EXPIRED, onExpired)
    return () => sessionEvents.removeEventListener(SESSION_EXPIRED, onExpired)
  }, [resetLocal])

  const completeSignIn = useCallback(
    async (response: LoginResponse) => {
      tokenStore.setFromLogin(response)
      setEndedReason(null)
      return loadPrincipal()
    },
    [loadPrincipal],
  )

  const signOut = useCallback(
    async (reason?: string) => {
      const refreshToken = tokenStore.getRefreshToken()
      try {
        if (refreshToken) await authApi.logout(refreshToken)
      } catch {
        // The local session ends regardless. The server session expires on its own.
      } finally {
        resetLocal(reason ?? null)
      }
    },
    [resetLocal],
  )

  const value = useMemo<AuthContextValue>(() => {
    const own = new Set(principal?.permissions ?? [])
    const roles = new Set(principal?.roles ?? [])
    return {
      status,
      principal,
      endedReason,
      clearEndedReason: () => setEndedReason(null),
      can: (permission) => own.has(permission),
      hasRole: (...codes) => codes.some((c) => roles.has(c)),
      completeSignIn,
      signOut,
      reloadPrincipal: async () => {
        await loadPrincipal()
      },
    }
  }, [status, principal, endedReason, completeSignIn, signOut, loadPrincipal])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
