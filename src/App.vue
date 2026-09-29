<script setup lang="ts"></script>

<template>
  <a href="#main" class="skip-link">Skip to content</a>
  <main id="main">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
</template>
