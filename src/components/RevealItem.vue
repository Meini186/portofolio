<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '../composables/useReveal'

const props = withDefaults(defineProps<{ index?: number }>(), { index: 0 })
const el = ref<HTMLElement | null>(null)
useReveal(el, props.index * 80)
</script>

<template>
  <div ref="el"><slot /></div>
</template>
