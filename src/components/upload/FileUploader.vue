<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits<{
  file: [file: File]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) emit('file', file)
}

function onSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) emit('file', file)
  target.value = ''
}

function openPicker() {
  fileInput.value?.click()
}
</script>

<template>
  <div
    :class="[
      'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors sm:p-12',
      isDragging
        ? 'border-gray-400 bg-gray-50 dark:border-gray-500 dark:bg-gray-800/50'
        : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600',
    ]"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
    @click="openPicker"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="mb-4 h-10 w-10 text-gray-400 dark:text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="1.5"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
    <p class="mb-1 text-sm text-gray-600 dark:text-gray-300">{{ t('upload.dropzone') }}</p>
    <p class="text-xs text-gray-400 dark:text-gray-500">{{ t('upload.browse') }}</p>
    <p class="mt-2 text-xs text-gray-400 dark:text-gray-600">{{ t('upload.hint') }}</p>
    <input ref="fileInput" type="file" accept=".txt" class="hidden" @change="onSelect" />
  </div>
</template>
