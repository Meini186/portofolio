import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'
import '@fontsource-variable/inter'
import './styles.css'

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior(to, _from, savedPosition) {
      if (savedPosition) return savedPosition
      if (!to.hash) return { top: 0 }
      // The new page mounts only after the out-in route transition, so the hash target may not
      // exist yet. Wait for it (max 1 s). No `behavior`: CSS `scroll-behavior` decides, and it
      // respects reduced motion.
      return new Promise((resolve) => {
        const start = performance.now()
        const tick = () => {
          if (document.querySelector(to.hash)) resolve({ el: to.hash, top: 72 })
          else if (performance.now() - start > 1000) resolve({ top: 0 })
          else requestAnimationFrame(tick)
        }
        tick()
      })
    },
  },
  undefined,
  // Hydrate the pre-rendered HTML instead of mounting from scratch (vite-ssg default is createApp).
  { hydration: true },
)
