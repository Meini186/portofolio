<script setup lang="ts">
import { CATEGORY_LABELS, CATEGORY_ORDER, type Filter } from '../content/queries'

defineProps<{ counts: Record<Filter, number> }>()
const model = defineModel<Filter>({ required: true })
const options: Filter[] = ['all', ...CATEGORY_ORDER]
const label = (f: Filter) => (f === 'all' ? 'All' : CATEGORY_LABELS[f])
</script>

<template>
  <div role="group" aria-label="Filter projects by area" class="flex flex-wrap gap-2">
    <button
      v-for="f in options"
      :key="f"
      type="button"
      :aria-pressed="model === f"
      class="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
      :class="model === f ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-primary-ink hover:border-primary'"
      @click="model = f"
    >{{ label(f) }} <span class="opacity-70">{{ counts[f] }}</span></button>
  </div>
</template>
