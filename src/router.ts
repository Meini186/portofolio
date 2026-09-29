import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('./pages/HomePage.vue') },
  {
    path: '/projects/:slug',
    name: 'project',
    component: () => import('./pages/ProjectPage.vue'),
    props: true,
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./pages/NotFoundPage.vue') },
]
