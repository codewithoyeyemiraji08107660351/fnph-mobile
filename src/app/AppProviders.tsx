import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { ApiError } from '@/lib/api/http'

/*
  Data, notices and the signed-in patient, around the whole app.
*/
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Permission and not-found answers will not change on retry.
      retry: (count, error) => !(error instanceof ApiError && (error.isContractError || [400, 401, 403, 404].includes(error.status))) && count < 2,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
