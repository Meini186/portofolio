<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { projects } from '../content/projects'
import { site } from '../content/site'
import { countByFilter, featuredProjects, filterProjects, hasContact, type Filter } from '../content/queries'
import { canonical, pageMeta } from '../content/meta'
import HeroSection from '../components/HeroSection.vue'
import StatsStrip from '../components/StatsStrip.vue'
import ProjectCard from '../components/ProjectCard.vue'
import ProjectFilter from '../components/ProjectFilter.vue'
import RevealItem from '../components/RevealItem.vue'
import SkillsSection from '../components/SkillsSection.vue'
import CertificatesSection from '../components/CertificatesSection.vue'
import ContactSection from '../components/ContactSection.vue'

const filter = ref<Filter>('all')
const visible = computed(() => filterProjects(projects, filter.value))
const counts = countByFilter(projects)
const featured = featuredProjects(projects)

useHead({
  link: [{ rel: 'canonical', href: canonical('/') }],
  meta: pageMeta({
    title: `${site.name} — ${site.roles[0]}`,
    description: site.intro,
    path: '/',
    image: '/og/home.png',
  }),
})
</script>

<template>
  <HeroSection />

  <section class="mx-auto max-w-6xl px-4 sm:px-6" aria-label="Highlights">
    <StatsStrip :stats="site.stats" />
  </section>

  <section id="featured" class="section" aria-labelledby="featured-title">
    <h2 id="featured-title" class="section-title">Featured work</h2>
    <div class="mt-8 grid gap-6 md:grid-cols-3">
      <RevealItem v-for="(p, i) in featured" :key="p.slug" :index="i">
        <ProjectCard :project="p" />
      </RevealItem>
    </div>
  </section>

  <section id="work" class="section" aria-labelledby="work-title">
    <h2 id="work-title" class="section-title">All projects</h2>
    <p class="mt-2 text-muted">Group projects list only the parts I did myself.</p>
    <ProjectFilter v-model="filter" :counts="counts" class="mt-6" />
    <p class="sr-only" aria-live="polite">Showing {{ visible.length }} projects</p>
    <TransitionGroup tag="ul" name="grid" class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="p in visible" :key="p.slug">
        <ProjectCard :project="p" />
      </li>
    </TransitionGroup>
  </section>

  <SkillsSection id="skills" :groups="site.skills" />
  <CertificatesSection id="certificates" :certificates="site.certificates" />
  <ContactSection v-if="hasContact(site.contact)" id="contact" :contact="site.contact" :cv-url="site.cvUrl" />
</template>
