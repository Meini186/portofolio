<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Project } from '../content/types'
import { CATEGORY_LABELS } from '../content/queries'
import { useTilt } from '../composables/useTilt'

const props = defineProps<{ project: Project }>()
const card = ref<HTMLElement | null>(null)
useTilt(card)
const cover = computed(() => props.project.images[0])
const coverFailed = ref(false)
</script>

<template>
  <article
    ref="card"
    class="card relative flex h-full flex-col overflow-hidden transition-[transform,box-shadow] duration-300 hover:shadow-[0_18px_40px_-18px_rgb(126_34_206/0.45)] motion-reduce:transition-none"
  >
    <div class="aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary-soft to-[#fce7f3]">
      <img
        v-if="cover && !coverFailed"
        :src="cover.src"
        alt=""
        :width="cover.width"
        :height="cover.height"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover object-top"
        @error="coverFailed = true"
      />
    </div>
    <div class="flex flex-1 flex-col p-5">
      <p class="eyebrow">{{ CATEGORY_LABELS[project.category] }}</p>
      <h3 class="mt-2 text-lg leading-snug font-semibold">
        <RouterLink :to="`/projects/${project.slug}`" class="after:absolute after:inset-0">{{ project.title }}</RouterLink>
      </h3>
      <p class="mt-2 flex-1 text-sm text-muted">{{ project.summary }}</p>
      <p class="mt-4 text-xs text-muted">{{ project.team }}</p>
    </div>
  </article>
</template>
