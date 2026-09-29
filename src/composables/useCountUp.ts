import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { motionAllowed } from './motion'

export const COUNT_DURATION = 1200

export const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3)

export function countValueAt(target: number, elapsedMs: number, duration = COUNT_DURATION): number {
  const p = Math.min(Math.max(elapsedMs / duration, 0), 1)
  return Math.round(target * easeOutCubic(p))
}

/**
 * Returns a number that equals `target` during SSR and without motion.
 * With motion, it resets to 0 after mount and counts up once `el` is visible.
 */
export function useCountUp(
  target: number,
  el: Ref<HTMLElement | null>,
  duration = COUNT_DURATION,
): Ref<number> {
  const value = ref(target)
  let observer: IntersectionObserver | undefined
  let frame = 0

  function run() {
    let start: number | undefined
    const step = (t: number) => {
      start ??= t
      value.value = countValueAt(target, t - start, duration)
      if (t - start < duration) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
  }

  onMounted(() => {
    if (!el.value || !motionAllowed()) return
    value.value = 0
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        observer?.disconnect()
        run()
      },
      { threshold: 0.4 },
    )
    observer.observe(el.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    cancelAnimationFrame(frame)
  })

  return value
}
