<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { db } from '@/db/schema'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const { t } = useI18n()

const confirming = ref(false)

async function deleteAllData() {
  await db.delete()
  window.location.href = '/'
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-12">
    <h1 class="mb-8 text-2xl font-light text-gray-800 dark:text-gray-100">
      {{ t('settings.title') }}
    </h1>

    <div class="space-y-6">
      <div>
        <h2 class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('settings.dataManagement') }}
        </h2>
        <BaseCard>
          <div v-if="!confirming">
            <BaseButton variant="secondary" size="sm" @click="confirming = true">
              {{ t('settings.deleteData') }}
            </BaseButton>
          </div>
          <div v-else class="space-y-3">
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ t('settings.deleteConfirm') }}
            </p>
            <div class="flex gap-2">
              <BaseButton variant="primary" size="sm" @click="deleteAllData">
                {{ t('common.confirm') }}
              </BaseButton>
              <BaseButton variant="ghost" size="sm" @click="confirming = false">
                {{ t('common.cancel') }}
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>

      <div>
        <h2 class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ t('settings.appInfo') }}
        </h2>
        <BaseCard>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('settings.version') }}: 0.1.0
          </p>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
