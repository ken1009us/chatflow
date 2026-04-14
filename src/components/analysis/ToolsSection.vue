<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { getMembers, searchMessages, updateMember } from '@/db/queries'
import type { Member, Message } from '@/types'

const { t } = useI18n()
const router = useRouter()

const props = defineProps<{
  sessionId: number
}>()

const emit = defineEmits<{
  membersUpdated: []
}>()

// --- Member management ---
const showMembers = ref(false)
const members = ref<Member[]>([])
const editingId = ref<number | null>(null)
const editName = ref('')

async function openMembers() {
  members.value = await getMembers(props.sessionId)
  showMembers.value = true
}

function startEdit(member: Member) {
  editingId.value = member.id!
  editName.value = member.displayName
}

async function saveEdit(member: Member) {
  const trimmed = editName.value.trim()
  if (trimmed && trimmed !== member.displayName) {
    await updateMember(member.id!, { displayName: trimmed })
    member.displayName = trimmed
    emit('membersUpdated')
  }
  editingId.value = null
}

function cancelEdit() {
  editingId.value = null
}

// --- Conversation index ---
const showSearch = ref(false)
const searchKeyword = ref('')
const searchResults = ref<Array<Message & { senderName: string }>>([])
const searching = ref(false)

async function openSearch() {
  searchKeyword.value = ''
  searchResults.value = []
  showSearch.value = true
}

async function doSearch() {
  if (!searchKeyword.value.trim()) return
  searching.value = true
  try {
    searchResults.value = await searchMessages(props.sessionId, searchKeyword.value.trim(), 100)
  } finally {
    searching.value = false
  }
}

// --- Export ---
async function exportData() {
  const members = await getMembers(props.sessionId)
  const { getAllMessagesForAnalysis } = await import('@/db/queries')
  const messages = await getAllMessagesForAnalysis(props.sessionId)

  const exportObj = {
    exportedAt: new Date().toISOString(),
    sessionId: props.sessionId,
    members: members.map(m => ({ name: m.name, displayName: m.displayName })),
    messageCount: messages.length,
    dateRange: messages.length > 0
      ? { start: messages[0].timestamp.toISOString(), end: messages[messages.length - 1].timestamp.toISOString() }
      : null,
  }

  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chatflow-export-${props.sessionId}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function formatTime(d: Date) {
  const date = d instanceof Date ? d : new Date(d)
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-neutral-900">
    <div class="flex flex-wrap gap-2">
      <BaseButton variant="secondary" size="sm" @click="router.push(`/upload?session=${sessionId}`)">
        {{ t('analysis.tools.importMore') }}
      </BaseButton>
      <BaseButton variant="secondary" size="sm" @click="openSearch">
        {{ t('analysis.tools.conversationIndex') }}
      </BaseButton>
      <BaseButton variant="secondary" size="sm" @click="openMembers">
        {{ t('analysis.tools.memberManagement') }}
      </BaseButton>
      <BaseButton variant="secondary" size="sm" @click="exportData">
        {{ t('analysis.tools.export') }}
      </BaseButton>
    </div>
  </div>

  <!-- Member Management Modal -->
  <BaseModal :open="showMembers" :title="t('analysis.tools.memberManagement')" @close="showMembers = false">
    <div class="max-h-80 space-y-2 overflow-y-auto">
      <div
        v-for="member in members"
        :key="member.id"
        class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-neutral-800"
      >
        <template v-if="editingId === member.id">
          <input
            v-model="editName"
            class="mr-2 flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-neutral-700 dark:text-gray-100"
            @keyup.enter="saveEdit(member)"
            @keyup.escape="cancelEdit"
          />
          <div class="flex gap-1">
            <BaseButton variant="primary" size="sm" @click="saveEdit(member)">{{ t('common.confirm') }}</BaseButton>
            <BaseButton variant="ghost" size="sm" @click="cancelEdit">{{ t('common.cancel') }}</BaseButton>
          </div>
        </template>
        <template v-else>
          <div class="flex-1">
            <span class="text-sm text-gray-800 dark:text-gray-200">{{ member.displayName }}</span>
            <span v-if="member.name !== member.displayName" class="ml-2 text-xs text-gray-400">({{ member.name }})</span>
          </div>
          <BaseButton variant="ghost" size="sm" @click="startEdit(member)">
            {{ t('analysis.tools.rename') }}
          </BaseButton>
        </template>
      </div>
    </div>
  </BaseModal>

  <!-- Conversation Index Modal -->
  <BaseModal :open="showSearch" :title="t('analysis.tools.conversationIndex')" @close="showSearch = false">
    <div class="flex gap-2">
      <input
        v-model="searchKeyword"
        :placeholder="t('analysis.tools.searchPlaceholder')"
        class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-neutral-700 dark:text-gray-100"
        @keyup.enter="doSearch"
      />
      <BaseButton variant="primary" size="sm" :disabled="searching" @click="doSearch">
        {{ t('analysis.tools.search') }}
      </BaseButton>
    </div>
    <div class="mt-3 max-h-72 space-y-1.5 overflow-y-auto">
      <div v-if="searching" class="py-4 text-center text-sm text-gray-500">{{ t('common.loading') }}</div>
      <div v-else-if="searchResults.length === 0 && searchKeyword" class="py-4 text-center text-sm text-gray-500">
        {{ t('analysis.tools.noResults') }}
      </div>
      <div
        v-for="msg in searchResults"
        :key="msg.id"
        class="rounded-lg bg-gray-50 px-3 py-2 dark:bg-neutral-800"
      >
        <div class="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <span class="font-medium text-gray-700 dark:text-gray-300">{{ msg.senderName }}</span>
          <span>{{ formatTime(msg.timestamp) }}</span>
        </div>
        <p class="mt-0.5 text-sm text-gray-800 dark:text-gray-200">{{ msg.content }}</p>
      </div>
    </div>
  </BaseModal>
</template>
