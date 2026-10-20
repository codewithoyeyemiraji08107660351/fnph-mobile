import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { fileURLToPath, URL } from 'node:url'

/*
  FNPH patient app (Android, Capacitor).

    npm run dev     http://localhost:5174 in a browser, API through the dev proxy
    npm run build   dist/, the folder Capacitor packages into the app

  The build reads VITE_API_BASE_URL from .env.production.
*/

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = (env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

  // Inside the app the page is served from the phone, so a relative /api
  // would point at the phone. Refuse to build an app that cannot reach the API.
  // Plain http is allowed only for a backend on this machine (localhost) or,
  // from the Android emulator, the host machine (10.0.2.2).
  const reachable = /^https:\/\/[^/]+$/.test(apiBase) || /^http:\/\/(localhost|10\.0\.2\.2)(:\d+)?$/.test(apiBase)
  if (command === 'build' && !reachable) {
    throw new Error(
      'The build needs VITE_API_BASE_URL set to the API origin over HTTPS, ' +
        'for example VITE_API_BASE_URL=https://app.fnphkaduna.cloud (no path, no trailing slash).',
    )
  }

  return {
    plugins: [react(), tailwindcss(), apiOriginInPage(apiBase)],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5174,
      proxy: {
        '/api': { target: env.VITE_API_PROXY_TARGET || 'http://localhost:8080', changeOrigin: true },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 700,
    },
  }
})

/**
  Writes the API origin into the page's Content-Security-Policy. A browser
  preview build is marked so the Android release check
  (android/app/build.gradle) refuses it.
*/
function apiOriginInPage(apiBase: string): Plugin {
  return {
    name: 'fnph-api-origin',
    transformIndexHtml: (html) => {
      const page = html.replace('__API_ORIGIN__', apiBase)
      return process.env.VITE_NATIVE_PREVIEW === '1'
        ? page.replace('<head>', '<head>\n    <meta name="fnph-build" content="preview" />')
        : page
    },
  }
}
