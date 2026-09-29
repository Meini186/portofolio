<script setup lang="ts">
import { site } from '../content/site'
import { hasContact } from '../content/queries'

const links = [
  { label: 'Work', to: '/#work', mobile: true },
  { label: 'Skills', to: '/#skills', mobile: true },
  { label: 'Certificates', to: '/#certificates', mobile: false },
  ...(hasContact(site.contact) ? [{ label: 'Contact', to: '/#contact', mobile: true }] : []),
]
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6" aria-label="Main">
      <RouterLink to="/" class="text-lg font-bold tracking-tight text-ink">{{ site.shortName }}</RouterLink>
      <ul class="flex gap-4 text-sm text-muted sm:gap-6">
        <li v-for="l in links" :key="l.to" :class="l.mobile ? '' : 'hidden sm:block'">
          <RouterLink :to="l.to" class="hover:text-primary">{{ l.label }}</RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
