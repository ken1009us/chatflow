<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
    <div class="mx-auto max-w-2xl text-center">
      <h1 class="mb-6 whitespace-pre-line text-4xl font-light leading-tight text-gray-800 dark:text-gray-100 md:text-5xl">
        {{ t('home.hero') }}
      </h1>
      <p class="mb-10 text-base font-light leading-relaxed text-gray-500 dark:text-gray-400">
        {{ t('home.description') }}
      </p>
      <BaseButton size="lg" @click="router.push('/upload')">
        {{ t('home.import') }}
      </BaseButton>
    </div>

    <div class="mx-auto mt-24 grid max-w-4xl gap-8 md:grid-cols-3">
      <div v-for="feature in ['analysis', 'visualization', 'privacy']" :key="feature" class="text-center">
        <h3 class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t(`home.features.${feature}`) }}
        </h3>
        <p class="text-xs leading-relaxed text-gray-500 dark:text-gray-500">
          {{ t(`home.features.${feature}Desc`) }}
        </p>
      </div>
    </div>
  </div>
</template>
