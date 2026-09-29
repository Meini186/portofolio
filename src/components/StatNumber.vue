<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCountUp } from '../composables/useCountUp'

const props = defineProps<{ value: number; label: string }>()
const el = ref<HTMLElement | null>(null)
const current = useCountUp(props.value, el)
const shown = computed(() => current.value.toLocaleString('en-US'))
const final = computed(() => props.value.toLocaleString('en-US'))
</script>

<template>
  <div ref="el" class="card px-4 py-5 text-center">
    <p aria-hidden="true" class="text-3xl font-bold tracking-tight text-primary tabular-nums sm:text-4xl">{{ shown }}</p>
    <p class="mt-1 text-xs text-muted sm:text-sm"><span class="sr-only">{{ final }} </span>{{ label }}</p>
  </div>
</template>
