<script setup lang="ts">
import type { Project } from '../content/types'

defineProps<{ prev?: Project; next?: Project }>()
</script>

<template>
  <nav aria-label="More projects" class="grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
    <RouterLink v-if="prev" :to="`/projects/${prev.slug}`" class="card p-5 transition-colors hover:border-primary">
      <span class="text-xs text-muted">← Previous</span>
      <span class="mt-1 block font-semibold">{{ prev.title }}</span>
    </RouterLink>
    <RouterLink
      v-if="next"
      :to="`/projects/${next.slug}`"
      class="card p-5 text-right transition-colors hover:border-primary sm:col-start-2"
    >
      <span class="text-xs text-muted">Next →</span>
      <span class="mt-1 block font-semibold">{{ next.title }}</span>
    </RouterLink>
  </nav>
</template>
