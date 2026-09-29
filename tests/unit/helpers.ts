import { mount, type VueWrapper } from '@vue/test-utils'
import type { Component } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createHead } from '@unhead/vue/client'
import { routes } from '../../src/router'

export async function mountWithApp(
  component: Component,
  props: Record<string, unknown> = {},
  path = '/',
): Promise<VueWrapper> {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mount(component as any, {
    props,
    attachTo: document.body,
    global: { plugins: [router, createHead()] },
  })
}
