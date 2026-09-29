<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { site } from './content/site'
import AppNav from './components/AppNav.vue'
import AppFooter from './components/AppFooter.vue'

useHead({
  htmlAttrs: { lang: 'en' },
  titleTemplate: (title?: string) => (title ? `${title} · ${site.name}` : `${site.name} — ${site.roles[0]}`),
})
</script>

<template>
  <a href="#main" class="skip-link">Skip to content</a>
  <AppNav />
  <main id="main">
    <RouterView v-slot="{ Component, route }">
      <!-- One element root so pages with several root nodes (HomePage) can transition;
           <Transition mode="out-in"> never finishes leaving a fragment. -->
      <Transition name="page" mode="out-in">
        <div :key="route.path">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
</template>
