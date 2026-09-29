// Client-only. Call these inside onMounted or event handlers, never during setup,
// so that SSR and the first client render produce identical HTML.

export function motionAllowed(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function finePointer(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}
