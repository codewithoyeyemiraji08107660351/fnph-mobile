import type { ReactNode } from 'react'
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle'

export function PageHeader({ kicker, title, description, actions }: { kicker?: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  useDocumentTitle(title)
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {kicker && <span className="kicker">{kicker}</span>}
        <h1 className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-[-0.035em]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ title, action, children, className = '', bodyClassName = 'p-5' }: {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          {title && <h2 className="text-[0.98rem] font-extrabold">{title}</h2>}
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export function EmptyState({ icon = 'bi-inbox', title, children }: { icon?: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-xl text-accent">
        <i aria-hidden className={`bi ${icon}`} />
      </span>
      <p className="mt-3 font-display font-bold">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : 'This could not be loaded.'
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-blush text-xl text-alarm">
        <i aria-hidden className="bi bi-cloud-slash" />
      </span>
      <p className="mt-3 font-display font-bold">This could not be loaded</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm mt-4" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
