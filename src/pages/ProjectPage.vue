<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import { getProject, neighbours } from '../content/queries'
import { canonical, pageMeta } from '../content/meta'
import { site } from '../content/site'
import ProjectDetail from '../components/ProjectDetail.vue'
import NotFoundPage from './NotFoundPage.vue'

const props = defineProps<{ slug: string }>()
const project = computed(() => getProject(props.slug))
const nav = computed(() => neighbours(props.slug))

useHead(() => {
  const p = project.value
  if (!p) return {}
  return {
    title: p.title,
    link: [{ rel: 'canonical', href: canonical(`/projects/${p.slug}`) }],
    meta: pageMeta({
      title: `${p.title} · ${site.name}`,
      description: p.summary,
      path: `/projects/${p.slug}`,
      image: `/og/${p.slug}.png`,
    }),
  }
})
</script>

<template>
  <ProjectDetail v-if="project" :project="project" :prev="nav.prev" :next="nav.next" />
  <NotFoundPage v-else />
</template>
