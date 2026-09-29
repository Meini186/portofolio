<script setup lang="ts">
import type { Stat } from '../content/types'
import StatNumber from './StatNumber.vue'

defineProps<{ stats: Stat[] }>()
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:gap-4" :class="stats.length >= 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'">
    <StatNumber v-for="s in stats" :key="s.label" :value="s.value" :label="s.label" />
  </div>
</template>
