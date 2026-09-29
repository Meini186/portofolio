import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import type { ViteSSGOptions } from 'vite-ssg'
import { projects } from './src/content/projects'

const ssgOptions: ViteSSGOptions = {
  dirStyle: 'nested',
  formatting: 'none',
  // Static paths come from the route table; dynamic ones (with ':') are replaced by
  // one path per project. '/404' renders the catch-all route for dist/404.html.
  includedRoutes(paths) {
    const staticPaths = paths.filter((p) => !p.includes(':'))
    return [...staticPaths, ...projects.map((p) => `/projects/${p.slug}`), '/404']
  },
}

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  ssgOptions,
})
