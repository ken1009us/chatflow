<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useChat } from '@/composables/useChat'
import { getAllSessions, deleteSession } from '@/db/queries'
import type { Session } from '@/types'
import FileUploader from '@/components/upload/FileUploader.vue'
import ProgressBar from '@/components/upload/ProgressBar.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const { t } = useI18n()
const router = useRouter()
const { parsing, progress, error, importFile } = useChat()

const sessions = ref<Session[]>([])

onMounted(loadSessions)

async function loadSessions() {
  sessions.value = await getAllSessions()
}

async function handleFile(file: File) {
  const id = await importFile(file)
  if (id) {
    await loadSessions()
  }
}

async function handleDelete(id: number) {
  await deleteSession(id)
  await loadSessions()
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-12">
    <h1 class="mb-8 text-2xl font-light text-gray-800 dark:text-gray-100">
      {{ t('upload.title') }}
    </h1>

    <FileUploader @file="handleFile" />

    <div v-if="parsing" class="mt-6">
      <ProgressBar :progress="progress" :label="t('upload.parsing')" />
    </div>

    <div v-if="error" class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
      {{ error }}
    </div>

    <div class="mt-12">
      <h2 class="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
        {{ t('upload.history') }}
      </h2>

      <div v-if="sessions.length === 0" class="text-sm text-gray-400 dark:text-gray-600">
        {{ t('upload.noHistory') }}
      </div>

      <div class="space-y-3">
        <BaseCard v-for="session in sessions" :key="session.id">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0">
              <h3 class="text-sm font-normal text-gray-800 dark:text-gray-100">
                {{ session.name }}
              </h3>
              <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {{ t('upload.messageCount', { count: session.messageCount }) }} ·
                {{ t('upload.memberCount', { count: session.memberCount }) }} ·
                {{ formatDate(session.importedAt) }}
              </p>
            </div>
            <div class="flex shrink-0 gap-2">
              <BaseButton variant="ghost" size="sm" @click="handleDelete(session.id!)">
                {{ t('upload.delete') }}
              </BaseButton>
              <BaseButton size="sm" @click="router.push(`/analysis/${session.id}`)">
                {{ t('upload.analyze') }}
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
