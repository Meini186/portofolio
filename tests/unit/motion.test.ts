import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, type Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { intersect, media } from '../setup'
import { countValueAt, easeOutCubic, useCountUp } from '../../src/composables/useCountUp'
import { tiltFromPointer, useTilt } from '../../src/composables/useTilt'
import { magneticOffset, useMagnetic } from '../../src/composables/useMagnetic'
import { useReveal } from '../../src/composables/useReveal'

const rect = { left: 0, top: 0, width: 200, height: 100 }

/** Mount a component whose root element uses a composable. */
function host(use: (el: Ref<HTMLElement | null>) => unknown) {
  let exposed: unknown
  const C = defineComponent({
    setup() {
      const el = ref<HTMLElement | null>(null)
      exposed = use(el)
      return () => h('div', { ref: el }, 'x')
    },
  })
  const wrapper = mount(C, { attachTo: document.body })
  return { wrapper, el: wrapper.element as HTMLElement, exposed }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('pure helpers', () => {
  it('easeOutCubic goes from 0 to 1', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875)
  })
  it('countValueAt clamps before start and after the end', () => {
    expect(countValueAt(2125, -10)).toBe(0)
    expect(countValueAt(2125, 600, 1200)).toBe(Math.round(2125 * 0.875))
    expect(countValueAt(2125, 99999)).toBe(2125)
  })
  it('tiltFromPointer is 0 at the centre and max at the corners', () => {
    expect(tiltFromPointer(100, 50, rect)).toEqual({ rotateX: 0, rotateY: 0 })
    expect(tiltFromPointer(200, 100, rect)).toEqual({ rotateX: -8, rotateY: 8 })
    expect(tiltFromPointer(9999, -9999, rect)).toEqual({ rotateX: 8, rotateY: 8 })
  })
  it('magneticOffset is capped at 6px', () => {
    expect(magneticOffset(100, 50, rect)).toEqual({ x: 0, y: 0 })
    expect(magneticOffset(9999, 9999, rect)).toEqual({ x: 6, y: 6 })
  })
})

describe('useCountUp', () => {
  it('starts at the final value (this is what SSR renders)', () => {
    media.reduce = true
    const { exposed } = host((el) => useCountUp(2125, el))
    expect((exposed as { value: number }).value).toBe(2125)
  })
  it('stays at the final value when motion is reduced', async () => {
    media.reduce = true
    const { exposed, el } = host((el) => useCountUp(2125, el))
    await nextTick()
    intersect(el)
    expect((exposed as { value: number }).value).toBe(2125)
  })
  it('keeps the final value for a number that is already on screen at load (no flash to 0)', async () => {
    const { exposed } = host((el) => useCountUp(2125, el)) // jsdom rect top 0 = inside the viewport
    await nextTick()
    expect((exposed as { value: number }).value).toBe(2125)
  })
  it('counts from 0 to the target once visible', async () => {
    const below = { top: 5000, left: 0, width: 10, height: 10, right: 10, bottom: 5010, x: 0, y: 5000, toJSON() {} }
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(below as DOMRect)
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'Date'] })
    const { exposed, el } = host((el) => useCountUp(2125, el))
    await nextTick()
    const value = exposed as { value: number }
    expect(value.value).toBe(0)
    intersect(el)
    vi.advanceTimersByTime(600)
    expect(value.value).toBeGreaterThan(0)
    expect(value.value).toBeLessThan(2125)
    vi.advanceTimersByTime(1000)
    expect(value.value).toBe(2125)
  })
})

describe('useTilt', () => {
  it('rotates on pointer move and resets on leave', () => {
    const { el } = host((el) => useTilt(el))
    el.getBoundingClientRect = () => ({ ...rect, right: 200, bottom: 100, x: 0, y: 0, toJSON() {} })
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 100 }))
    expect(el.style.transform).toContain('rotateX(-8.00deg)')
    el.dispatchEvent(new MouseEvent('pointerleave'))
    expect(el.style.transform).toBe('')
  })
  it('does nothing when motion is reduced', () => {
    media.reduce = true
    const { el } = host((el) => useTilt(el))
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 100 }))
    expect(el.style.transform).toBe('')
  })
  it('does nothing on touch screens', () => {
    media.fine = false
    const { el } = host((el) => useTilt(el))
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 100 }))
    expect(el.style.transform).toBe('')
  })
})

describe('useMagnetic', () => {
  it('moves toward the pointer and resets on leave', () => {
    const { el } = host((el) => useMagnetic(el))
    el.getBoundingClientRect = () => ({ ...rect, right: 200, bottom: 100, x: 0, y: 0, toJSON() {} })
    el.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 100 }))
    expect(el.style.transform).toBe('translate(6.00px, 6.00px)')
    el.dispatchEvent(new MouseEvent('pointerleave'))
    expect(el.style.transform).toBe('')
  })
})

describe('useReveal', () => {
  const below = { top: 5000, left: 0, width: 10, height: 10, right: 10, bottom: 5010, x: 0, y: 5000, toJSON() {} }

  it('never hides an element that is already on screen', async () => {
    const { el } = host((el) => useReveal(el))
    await nextTick()
    expect(el.classList.contains('reveal-init')).toBe(false)
  })
  it('hides a below-the-fold element, then reveals it with the stagger delay', async () => {
    const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(below as DOMRect)
    const { el } = host((el) => useReveal(el, 160))
    await nextTick()
    expect(el.classList.contains('reveal-init')).toBe(true)
    intersect(el)
    expect(el.classList.contains('reveal-init')).toBe(false)
    expect(el.classList.contains('reveal-in')).toBe(true)
    expect(el.style.transitionDelay).toBe('160ms')
    spy.mockRestore()
  })
  it('does nothing when motion is reduced, so content is always visible', async () => {
    media.reduce = true
    const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(below as DOMRect)
    const { el } = host((el) => useReveal(el))
    await nextTick()
    expect(el.classList.contains('reveal-init')).toBe(false)
    spy.mockRestore()
  })
})
