<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProjectImage } from '../content/types'

const props = defineProps<{ images: ProjectImage[] }>()
const index = defineModel<number | null>('index', { required: true })

const dialog = ref<HTMLDialogElement | null>(null)
const current = computed(() => (index.value === null ? undefined : props.images[index.value]))
let opener: HTMLElement | null = null

watch(index, (i, prev) => {
  const d = dialog.value
  if (!d) return
  if (i !== null && prev === null && !d.open) {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    d.showModal()
  }
  if (i === null && d.open) d.close()
})

function onClose() {
  index.value = null
  opener?.focus()
  opener = null
}
function step(dir: 1 | -1) {
  if (index.value === null) return
  const n = props.images.length
  index.value = (index.value + dir + n) % n
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
}
</script>

<template>
  <dialog ref="dialog" class="lightbox" aria-label="Image viewer" @close="onClose" @keydown="onKey">
    <figure
      v-if="current"
      class="flex h-full flex-col items-center justify-center gap-3 p-4 sm:p-10"
      @click.self="dialog?.close()"
    >
      <img
        :src="current.src"
        :alt="current.alt"
        :width="current.width"
        :height="current.height"
        class="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
      />
      <figcaption class="text-center text-sm text-white/80">
        {{ current.caption ?? current.alt }} · {{ (index ?? 0) + 1 }} / {{ images.length }}
      </figcaption>
    </figure>
    <button type="button" class="lightbox-btn top-4 right-4" aria-label="Close image viewer" @click="dialog?.close()">
      ✕
    </button>
    <template v-if="images.length > 1">
      <button type="button" class="lightbox-btn top-1/2 left-4 -translate-y-1/2" aria-label="Previous image" @click="step(-1)">
        ←
      </button>
      <button type="button" class="lightbox-btn top-1/2 right-4 -translate-y-1/2" aria-label="Next image" @click="step(1)">
        →
      </button>
    </template>
  </dialog>
</template>
