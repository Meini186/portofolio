<script setup lang="ts">
import { ref } from 'vue'
import { site } from '../content/site'
import { useMagnetic } from '../composables/useMagnetic'

const magnet = ref<HTMLElement | null>(null)
useMagnetic(magnet)
</script>

<template>
  <section class="relative overflow-hidden" aria-labelledby="hero-title">
    <div aria-hidden="true" class="hero-blob pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#e9d5ff] blur-3xl"></div>
    <div aria-hidden="true" class="hero-blob hero-blob--2 pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[#fbcfe8] blur-3xl"></div>
    <div class="relative mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
      <p class="eyebrow">{{ site.roles.join(' · ') }}</p>
      <h1 id="hero-title" class="mt-3 max-w-3xl text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
        {{ site.headline.lead }} <span class="text-primary">{{ site.headline.highlight }}</span>
      </h1>
      <p class="mt-5 max-w-xl text-base text-muted sm:text-lg">{{ site.intro }}</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <span ref="magnet" class="inline-block transition-transform duration-200 motion-reduce:transition-none">
          <RouterLink to="/#work" class="btn-primary">View projects</RouterLink>
        </span>
        <a v-if="site.cvUrl" :href="site.cvUrl" download class="btn-secondary">Download CV</a>
      </div>
    </div>
  </section>
</template>
