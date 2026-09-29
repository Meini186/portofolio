<script setup lang="ts">
import { ref } from 'vue'
import type { Project } from '../content/types'
import { CATEGORY_LABELS } from '../content/queries'
import StatsStrip from './StatsStrip.vue'
import ScreenshotGallery from './ScreenshotGallery.vue'
import ImageLightbox from './ImageLightbox.vue'
import ProjectNav from './ProjectNav.vue'

defineProps<{ project: Project; prev?: Project; next?: Project }>()
const lightboxIndex = ref<number | null>(null)
</script>

<template>
  <article class="section">
    <RouterLink to="/#work" class="text-sm font-medium text-primary hover:underline">← All projects</RouterLink>

    <header class="mt-6">
      <p class="eyebrow">{{ CATEGORY_LABELS[project.category] }}</p>
      <h1 class="mt-2 max-w-4xl text-3xl font-bold tracking-tight break-words sm:text-5xl">{{ project.title }}</h1>
      <dl class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
        <div><dt class="sr-only">Team</dt><dd>{{ project.team }}</dd></div>
        <div><dt class="sr-only">Course</dt><dd>{{ project.course }}</dd></div>
        <div v-if="project.term"><dt class="sr-only">Term</dt><dd>{{ project.term }}</dd></div>
        <div v-if="project.role"><dt class="sr-only">Role</dt><dd>{{ project.role }}</dd></div>
      </dl>
      <ul class="mt-4 flex flex-wrap gap-2" aria-label="Tools">
        <li v-for="t in project.tools" :key="t" class="chip">{{ t }}</li>
      </ul>
      <ul v-if="project.links?.length" class="mt-6 flex flex-wrap gap-3">
        <li v-for="(l, i) in project.links" :key="l.href">
          <a :href="l.href" target="_blank" rel="noopener noreferrer" :class="i === 0 ? 'btn-primary' : 'btn-secondary'">
            {{ l.label }} <span aria-hidden="true">↗</span><span class="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      </ul>
    </header>

    <section class="mt-12 max-w-3xl" aria-labelledby="overview-title">
      <h2 id="overview-title" class="text-xl font-bold tracking-tight sm:text-2xl">Overview</h2>
      <p class="mt-3 leading-relaxed text-muted">{{ project.overview }}</p>
    </section>

    <section class="mt-10 max-w-3xl" aria-labelledby="contribution-title">
      <h2 id="contribution-title" class="text-xl font-bold tracking-tight sm:text-2xl">My contribution</h2>
      <ul class="mt-4 space-y-3">
        <li v-for="c in project.contributions" :key="c" class="flex gap-3">
          <span aria-hidden="true" class="mt-2 h-2 w-2 flex-none rounded-full bg-accent"></span>
          <span class="leading-relaxed">{{ c }}</span>
        </li>
      </ul>
    </section>

    <section v-if="project.images.length" class="mt-12" aria-labelledby="gallery-title">
      <h2 id="gallery-title" class="text-xl font-bold tracking-tight sm:text-2xl">Gallery</h2>
      <ScreenshotGallery class="mt-4" :images="project.images" @open="lightboxIndex = $event" />
      <ImageLightbox v-model:index="lightboxIndex" :images="project.images" />
    </section>

    <section v-if="project.stats?.length" class="mt-12" aria-labelledby="numbers-title">
      <h2 id="numbers-title" class="text-xl font-bold tracking-tight sm:text-2xl">Key numbers</h2>
      <StatsStrip class="mt-4" :stats="project.stats" />
    </section>

    <ProjectNav class="mt-16" :prev="prev" :next="next" />
  </article>
</template>
