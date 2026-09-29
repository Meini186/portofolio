import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { finePointer, motionAllowed } from './motion'

export const MAX_MAGNET = 6

type Box = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>
const unit = (v: number) => Math.max(-1, Math.min(1, v))

export function magneticOffset(clientX: number, clientY: number, rect: Box, max = MAX_MAGNET) {
  const x = unit((clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * max
  const y = unit((clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * max
  return { x: x + 0, y: y + 0 } // + 0 turns -0 into 0
}

export function useMagnetic(el: Ref<HTMLElement | null>): void {
  function onMove(e: PointerEvent | MouseEvent) {
    const node = el.value
    if (!node || !motionAllowed() || !finePointer()) return
    const { x, y } = magneticOffset(e.clientX, e.clientY, node.getBoundingClientRect())
    node.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`
  }
  function onLeave() {
    if (el.value) el.value.style.transform = ''
  }
  onMounted(() => {
    el.value?.addEventListener('pointermove', onMove)
    el.value?.addEventListener('pointerleave', onLeave)
  })
  onBeforeUnmount(() => {
    el.value?.removeEventListener('pointermove', onMove)
    el.value?.removeEventListener('pointerleave', onLeave)
  })
}
