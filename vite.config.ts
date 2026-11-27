import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

/**
 * Project folder with its real on-disk casing. On Windows the folder can be opened as
 * "e:\..." or "E:\..."; mixing both makes the bundler load the same file twice (two
 * copies of React / of a context), which crashes the app. Using one canonical path
 * for the root and the "@" alias avoids that whichever way the folder was opened.
 */
const ROOT = fs.realpathSync.native(__dirname)

/**
 * The admin panel is a separate app at /admin/ (admin/index.html -> src/admin).
 * Its client-side routes (/admin/bookings, /admin/theatres/123, ...) must load
 * admin/index.html, not the customer site's index.html. Production hosting
 * needs the same rewrite: /admin/* -> /admin/index.html.
 */
function adminSpaFallback(): Plugin {
  const rewrite = (req: { url?: string }, _res: unknown, next: () => void) => {
    const url = req.url ?? ''
    const pathOnly = url.split('?')[0]
    const isAdminPage = pathOnly === '/admin' || (pathOnly.startsWith('/admin/') && !path.extname(pathOnly))
    if (isAdminPage) req.url = '/admin/index.html'
    next()
  }
  return {
    name: 'admin-spa-fallback',
    configureServer: (server) => { server.middlewares.use(rewrite) },
    configurePreviewServer: (server) => { server.middlewares.use(rewrite) },
  }
}

export default defineConfig({
  root: ROOT,
  plugins: [react(), adminSpaFallback()],
  resolve: {
    alias: {
      '@': path.join(ROOT, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.join(ROOT, 'index.html'),
        admin: path.join(ROOT, 'admin/index.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor'
            if (id.includes('@tanstack')) return 'query'
            if (id.includes('@radix-ui')) return 'ui'
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'forms'
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
})
