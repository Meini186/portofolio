import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import type { ViteSSGOptions } from 'vite-ssg'

const ssgOptions: ViteSSGOptions = {
  dirStyle: 'nested',
  formatting: 'none',
}

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  ssgOptions,
})
