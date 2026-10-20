import { useState } from 'react'
import { uploadsApi, type UploadRow } from '@/lib/api/endpoints/records'
import { platform } from '@/lib/platform'
import { toApiError } from '@/lib/api/http'
import { useAuth } from '@/lib/auth/AuthProvider'
import { formatDateTime, humanise } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { ReasonDialog } from '@/components/ui/ReasonDialog'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { FileThumbnail, ImageViewerDialog } from './FilePreview'
import { isImageUpload } from './uploadImage'

const size = (b: number) => (b > 1_048_576 ? `${(b / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

/** The patient's own uploaded files: view, download, and delete where allowed. */
export function FileList({ rows, onChanged }: { rows: UploadRow[]; onChanged: () => void }) {
  const { can } = useAuth()
  const toast = useToast()
  const [busy, setBusy] = useState<string | null>(null)
  const [acting, setActing] = useState<UploadRow | null>(null)
  const [viewing, setViewing] = useState<UploadRow | null>(null)
  if (rows.length === 0) return <p className="text-sm text-muted">No files.</p>
  return (
    <>
      <ul className="space-y-2">
        {rows.map((u) => {
          const blocked = u.scanStatus === 'QUARANTINED' || u.scanStatus === 'REJECTED'
          return (
            <li key={u.publicId} className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-line px-3 py-2 text-sm">
              {!blocked && isImageUpload(u) && <FileThumbnail row={u} onOpen={() => setViewing(u)} />}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{u.originalFileName}</span>
                <span className="block text-xs text-muted">{humanise(u.category)}. {size(u.sizeBytes)}. {u.uploadedBy}, {formatDateTime(u.uploadedAt)}{u.description ? `. ${u.description}` : ''}</span>
              </span>
              <span className="flex flex-wrap items-center gap-1">
                {blocked ? <Badge tone="red">Held back</Badge> : u.scanStatus === 'CLEAN' ? <Badge tone="green">Checked</Badge> : <Badge tone="gold">{humanise(u.scanStatus)}</Badge>}
                {!blocked && isImageUpload(u) && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewing(u)}>
                    <i aria-hidden className="bi bi-eye" /> View
                  </button>
                )}
                {!blocked && (
                  <button type="button" className="btn btn-quiet btn-sm" disabled={busy === u.publicId} onClick={async () => {
                    setBusy(u.publicId)
                    try { const f = await uploadsApi.download(u.publicId); toast(await platform.saveFile(f.blob, f.filename, `upload-${u.publicId}`)) } catch (err) { toast(toApiError(err).message, 'error') } finally { setBusy(null) }
                  }}>{busy === u.publicId ? <Spinner /> : 'Download'}</button>
                )}
                {can('upload.delete') && <button type="button" className="btn btn-quiet btn-sm text-alarm" onClick={() => setActing(u)}>Delete</button>}
              </span>
            </li>
          )
        })}
      </ul>
      {viewing && <ImageViewerDialog row={viewing} onClose={() => setViewing(null)} />}
      {acting && (
        <ReasonDialog
          title={`Delete ${acting.originalFileName}?`}
          description="The file is removed from use and its storage is queued for deletion. The record of it stays."
          label="Why" min={5} danger confirmLabel="Delete"
          onClose={() => setActing(null)}
          onConfirm={async (reason) => {
            await uploadsApi.remove(acting.publicId, reason)
            toast('File deleted.')
            setActing(null)
            onChanged()
          }}
        />
      )}
    </>
  )
}
