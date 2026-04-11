import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/upload',
      name: 'upload',
      component: () => import('@/views/Upload.vue'),
    },
    {
      path: '/analysis/:id?',
      name: 'analysis',
      component: () => import('@/views/Analysis.vue'),
    },
{
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/Settings.vue'),
    },
    {
      path: '/shared',
      name: 'shared',
      component: () => import('@/views/SharedAnalysis.vue'),
    },
    {
      path: '/s/:id',
      name: 'shared-short',
      component: () => import('@/views/SharedAnalysis.vue'),
    },
  ],
})

export default router
