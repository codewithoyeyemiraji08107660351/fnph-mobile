/*
  What differs between running on a phone and in a browser.

  Screens call these instead of browser APIs that do not work inside an app
  (navigating the whole page to a payment provider, saving a file through a
  download link). The defaults below serve npm run dev in a browser. On the
  phone, src/main.tsx replaces them with src/native/platform.ts.
*/

export type CallReadiness = { ok: true } | { ok: false; message: string }

export interface Platform {
  /** Opens the payment provider's page. onReturn runs when the patient is back, where that can be detected. */
  openPayment: (url: string, onReturn: () => void) => Promise<void>
  /** Gives the patient a downloaded file. Returns the confirmation to show. */
  saveFile: (blob: Blob, filename: string, key: string) => Promise<string>
  /** True when saveFile keeps a copy that openSaved can reopen without downloading again. */
  keepsFiles: boolean
  /** Opens the copy saved under key. False when there is none on this device. */
  openSaved: (key: string) => Promise<boolean>
  /** Asks for camera and microphone before the video room loads. */
  prepareCall: () => Promise<CallReadiness>
}

export const platform: Platform = {
  async openPayment(url) {
    window.location.assign(url)
  },
  async saveFile(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    return 'Saved. Keep the file somewhere you can find it again.'
  },
  keepsFiles: false,
  async openSaved() {
    return false
  },
  // The browser asks for camera and microphone inside the video room itself.
  async prepareCall() {
    return { ok: true }
  },
}

/** Called once by the patient app before it renders. */
export function installPlatform(native: Partial<Platform>) {
  Object.assign(platform, native)
}
