<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({ title: 'Page not found', meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <section class="section text-center">
    <p class="eyebrow">404</p>
    <h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">This page does not exist</h1>
    <p class="mt-4 text-muted">The link may be old or mistyped.</p>
    <RouterLink to="/" class="btn-primary mt-8">Back to home</RouterLink>
  </section>
</template>
