<script setup lang="ts">
import type { Certificate } from '../content/types'
import RevealItem from './RevealItem.vue'

defineProps<{ certificates: Certificate[] }>()
</script>

<template>
  <section class="section" aria-labelledby="certificates-title">
    <h2 id="certificates-title" class="section-title">Certificates</h2>
    <ul class="mt-8 grid gap-4 sm:grid-cols-2">
      <li v-for="(c, i) in certificates" :key="c.name">
        <RevealItem :index="i">
          <div class="card h-full p-5">
            <p class="eyebrow">{{ c.issuer }}</p>
            <p class="mt-2 font-semibold">{{ c.name }}</p>
            <p class="mt-1 text-sm text-muted">{{ c.date }}</p>
          </div>
        </RevealItem>
      </li>
    </ul>
  </section>
</template>
