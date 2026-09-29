import { existsSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import type { ViteSSGOptions } from 'vite-ssg'
import { projects } from './src/content/projects'

const ssgOptions: ViteSSGOptions = {
  // dist/projects/<slug>.html, served at /projects/<slug> by vercel.json `cleanUrls`.
  dirStyle: 'flat',
  formatting: 'none',
  // Static paths come from the route table; dynamic ones (with ':') are replaced by
  // one path per project. '/404' renders the catch-all route to dist/404.html.
  includedRoutes(paths) {
    const staticPaths = paths.filter((p) => !p.includes(':'))
    return [...staticPaths, ...projects.map((p) => `/projects/${p.slug}`), '/404']
  },
}

/**
 * Makes `vite preview` behave like Vercel with vercel.json
 * ({ cleanUrls: true, trailingSlash: false }), so e2e tests see what visitors get:
 * a trailing slash redirects to the clean URL, and unknown paths get 404.html with status 404.
 */
function staticHostPreview(): Plugin {
  const dist = resolve(import.meta.dirname, 'dist')
  const isFile = (p: string) => existsSync(p) && statSync(p).isFile()
  return {
    name: 'static-host-preview',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const path = decodeURIComponent(url.pathname)
        if (path === '/') return next()
        if (path.endsWith('/')) {
          res.statusCode = 308
          res.setHeader('Location', path.replace(/\/+$/, '') + url.search)
          return res.end()
        }
        if (isFile(join(dist, path)) || isFile(join(dist, `${path}.html`))) return next()
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(readFileSync(join(dist, '404.html')))
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), staticHostPreview()],
  ssgOptions,
})
