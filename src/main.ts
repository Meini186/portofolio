import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'
import '@fontsource-variable/inter'
import './styles.css'

export const createApp = ViteSSG(App, {
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    // No `behavior` here: CSS `scroll-behavior` decides, and it respects reduced motion.
    if (to.hash) return { el: to.hash, top: 72 }
    return { top: 0 }
  },
})
