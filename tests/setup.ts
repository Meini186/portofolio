import { afterEach, vi } from 'vitest'

/** Test-controlled results for window.matchMedia. */
export const media = { reduce: false, fine: true }

type IOCallback = (entries: Array<{ isIntersecting: boolean; target: Element }>) => void
const observers = new Map<Element, IOCallback>()

class FakeIntersectionObserver {
  constructor(private cb: IOCallback) {}
  observe(el: Element) {
    observers.set(el, this.cb)
  }
  unobserve(el: Element) {
    observers.delete(el)
  }
  disconnect() {
    for (const [el, cb] of observers) if (cb === this.cb) observers.delete(el)
  }
  takeRecords() {
    return []
  }
}

/** Fire the IntersectionObserver callback registered for `el`. */
export function intersect(el: Element, isIntersecting = true) {
  observers.get(el)?.([{ isIntersecting, target: el }])
}

// Browser shims. Skipped for test files that run with `@vitest-environment node`.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('reduce') ? media.reduce : query.includes('pointer: fine') ? media.fine : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
  Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: FakeIntersectionObserver })

  // jsdom does not implement <dialog> modal behaviour.
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}

export function resetDom() {
  media.reduce = false
  media.fine = true
  observers.clear()
}

afterEach(() => resetDom())
