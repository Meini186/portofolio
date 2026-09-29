<script setup lang="ts">
import type { Contact } from '../content/types'

defineProps<{ contact: Contact; cvUrl?: string }>()
</script>

<template>
  <section class="section" aria-labelledby="contact-title">
    <div class="card bg-gradient-to-br from-surface to-bg-2 p-8 text-center sm:p-12">
      <h2 id="contact-title" class="section-title">Let's talk</h2>
      <p class="mx-auto mt-3 max-w-md text-muted">Interested in data, BI, QA, or database work? I'd like to hear from you.</p>
      <ul class="mt-8 flex flex-wrap justify-center gap-3">
        <li v-if="contact.email"><a :href="`mailto:${contact.email}`" class="btn-primary">Email me</a></li>
        <li v-if="contact.linkedin">
          <a :href="contact.linkedin" target="_blank" rel="noopener noreferrer" class="btn-secondary">LinkedIn <span aria-hidden="true">↗</span><span class="sr-only">(opens in a new tab)</span></a>
        </li>
        <li v-if="contact.github">
          <a :href="contact.github" target="_blank" rel="noopener noreferrer" class="btn-secondary">GitHub <span aria-hidden="true">↗</span><span class="sr-only">(opens in a new tab)</span></a>
        </li>
        <li v-if="cvUrl"><a :href="cvUrl" download class="btn-secondary">Download CV</a></li>
      </ul>
    </div>
  </section>
</template>
