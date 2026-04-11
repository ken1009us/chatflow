<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useSettingsStore } from '@/stores/settings'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import LanguageSwitchCompact from '@/components/common/LanguageSwitchCompact.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const settings = useSettingsStore()

useTheme()

const isShared = computed(() => route.path === '/shared' || route.path.startsWith('/s/'))

const navItems = [
  { path: '/', key: 'home' },
  { path: '/upload', key: 'upload' },
  { path: '/settings', key: 'settings' },
] as const
</script>

<template>
  <div class="min-h-screen bg-stone-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-neutral-950/80">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <span
          class="text-lg font-light tracking-wide text-gray-800 dark:text-gray-100"
          :class="!isShared ? 'cursor-pointer' : ''"
          @click="!isShared && router.push('/')"
        >
          ChatFlow
        </span>

        <nav v-if="!isShared" class="hidden items-center gap-6 sm:flex">
          <router-link
            v-for="item in navItems"
            :key="item.key"
            :to="item.path"
            :class="[
              'text-xs transition-colors',
              route.path === item.path
                ? 'text-gray-800 dark:text-white'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200',
            ]"
          >
            {{ t(`nav.${item.key}`) }}
          </router-link>
        </nav>

        <div class="flex items-center gap-1">
          <LanguageSwitchCompact />
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- Mobile nav -->
    <nav v-if="!isShared" class="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden dark:border-gray-800 dark:bg-neutral-950">
      <router-link
        v-for="item in navItems"
        :key="item.key"
        :to="item.path"
        :class="[
          'flex min-h-[44px] flex-1 items-center justify-center text-xs',
          route.path === item.path
            ? 'text-gray-800 dark:text-white'
            : 'text-gray-400 dark:text-gray-400',
        ]"
      >
        {{ t(`nav.${item.key}`) }}
      </router-link>
    </nav>

    <!-- Main content -->
    <main class="pb-[calc(44px+env(safe-area-inset-bottom))] sm:pb-0">
      <router-view />
    </main>
  </div>
</template>
