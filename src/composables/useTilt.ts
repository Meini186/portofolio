import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { finePointer, motionAllowed } from './motion'

export const MAX_TILT = 8

type Box = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>
const half = (v: number) => Math.max(-0.5, Math.min(0.5, v))

export function tiltFromPointer(clientX: number, clientY: number, rect: Box, max = MAX_TILT) {
  const x = half((clientX - rect.left) / rect.width - 0.5)
  const y = half((clientY - rect.top) / rect.height - 0.5)
  return { rotateX: -y * 2 * max + 0, rotateY: x * 2 * max + 0 } // + 0 turns -0 into 0
}

export function useTilt(el: Ref<HTMLElement | null>): void {
  function onMove(e: PointerEvent | MouseEvent) {
    const node = el.value
    if (!node || !motionAllowed() || !finePointer()) return
    const { rotateX, rotateY } = tiltFromPointer(e.clientX, e.clientY, node.getBoundingClientRect())
    node.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`
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
