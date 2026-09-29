<script setup lang="ts">
import { ref } from 'vue'
import type { ProjectImage } from '../content/types'
import { motionAllowed } from '../composables/motion'

defineProps<{ images: ProjectImage[] }>()
const emit = defineEmits<{ open: [index: number] }>()

const track = ref<HTMLElement | null>(null)
const failed = ref<Set<number>>(new Set())
const dragging = ref(false)
let drag: { x: number; left: number; moved: boolean } | null = null
let suppressClick = false

function scrollByPage(dir: 1 | -1) {
  const t = track.value
  if (!t) return
  t.scrollBy({ left: dir * t.clientWidth * 0.8, behavior: motionAllowed() ? 'smooth' : 'auto' })
}

// Mouse drag-to-scroll. Touch and trackpad use native scrolling.
function onPointerDown(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !track.value) return
  drag = { x: e.clientX, left: track.value.scrollLeft, moved: false }
}
function onPointerMove(e: PointerEvent) {
  if (!drag || !track.value) return
  const dx = e.clientX - drag.x
  if (Math.abs(dx) > 5) {
    drag.moved = true
    dragging.value = true
  }
  track.value.scrollLeft = drag.left - dx
}
function onPointerUp() {
  if (drag?.moved) suppressClick = true
  drag = null
  dragging.value = false
}
function open(i: number) {
  if (suppressClick) {
    suppressClick = false
    return
  }
  emit('open', i)
}
function markFailed(i: number) {
  failed.value = new Set(failed.value).add(i)
}
</script>

<template>
  <div>
    <div
      ref="track"
      class="gallery flex gap-4 overflow-x-auto pb-4"
      :class="dragging ? 'cursor-grabbing snap-none' : 'snap-x snap-mandatory'"
      tabindex="0"
      role="region"
      aria-label="Screenshots, scroll sideways"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <figure v-for="(img, i) in images" :key="img.src" class="w-[85%] flex-none snap-start sm:w-[60%] lg:w-[45%]">
        <button
          type="button"
          class="block w-full overflow-hidden rounded-xl border border-line bg-surface"
          :aria-label="`Open image ${i + 1} of ${images.length}: ${img.alt}`"
          @click="open(i)"
        >
          <img
            v-if="!failed.has(i)"
            :src="img.src"
            :alt="img.alt"
            :width="img.width"
            :height="img.height"
            loading="lazy"
            decoding="async"
            draggable="false"
            class="aspect-[16/10] w-full object-cover object-top"
            @error="markFailed(i)"
          />
          <span
            v-else
            class="flex aspect-[16/10] w-full items-center justify-center bg-primary-soft p-4 text-sm text-muted"
            >{{ img.alt }}</span
          >
        </button>
        <figcaption v-if="img.caption" class="mt-2 text-sm text-muted">{{ img.caption }}</figcaption>
      </figure>
    </div>
    <div v-if="images.length > 1" class="mt-2 flex justify-end gap-2">
      <button type="button" class="btn-secondary px-3 py-2" aria-label="Scroll screenshots left" @click="scrollByPage(-1)">
        ←
      </button>
      <button type="button" class="btn-secondary px-3 py-2" aria-label="Scroll screenshots right" @click="scrollByPage(1)">
        →
      </button>
    </div>
  </div>
</template>
