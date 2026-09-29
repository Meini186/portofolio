import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { motionAllowed } from './motion'

/**
 * Fades an element up the first time it scrolls into view.
 * Elements that are already visible on load are never hidden, so there is no flash.
 */
export function useReveal(el: Ref<HTMLElement | null>, delayMs = 0): void {
  let observer: IntersectionObserver | undefined

  onMounted(() => {
    const node = el.value
    if (!node || !motionAllowed()) return
    if (node.getBoundingClientRect().top < window.innerHeight) return

    node.classList.add('reveal-init')
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        node.style.transitionDelay = `${delayMs}ms`
        node.classList.add('reveal-in')
        node.classList.remove('reveal-init')
        observer?.disconnect()
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(node)
  })

  onBeforeUnmount(() => observer?.disconnect())
}
