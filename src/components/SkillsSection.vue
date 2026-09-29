<script setup lang="ts">
import type { SkillGroup } from '../content/types'
import RevealItem from './RevealItem.vue'

defineProps<{ groups: SkillGroup[] }>()
</script>

<template>
  <section class="section" aria-labelledby="skills-title">
    <h2 id="skills-title" class="section-title">Skills &amp; tools</h2>
    <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RevealItem v-for="(g, i) in groups" :key="g.group" :index="i">
        <div class="card h-full p-5">
          <h3 class="font-semibold">{{ g.group }}</h3>
          <ul class="mt-3 flex flex-wrap gap-2">
            <li v-for="s in g.items" :key="s" class="chip">{{ s }}</li>
          </ul>
        </div>
      </RevealItem>
    </div>
  </section>
</template>
