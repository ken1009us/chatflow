<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUIStore } from '@/stores/ui'
import { getSession } from '@/db/queries'
import { useAnalysis } from '@/composables/useAnalysis'
import { useShare } from '@/composables/useShare'
import type { Session } from '@/types'
import type { DateFilter } from '@/components/analysis/FilterBar.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatsSummary from '@/components/analysis/StatsSummary.vue'
import FunFacts from '@/components/analysis/FunFacts.vue'
import FilterBar from '@/components/analysis/FilterBar.vue'
import ActivityTrendChart from '@/components/charts/ActivityTrendChart.vue'
import PeakHoursHeatmap from '@/components/charts/PeakHoursHeatmap.vue'
import MemberRankingChart from '@/components/charts/MemberRankingChart.vue'
import MemberActivityChart from '@/components/charts/MemberActivityChart.vue'
import MessageTypeChart from '@/components/charts/MessageTypeChart.vue'
import WordCloudChart from '@/components/charts/WordCloudChart.vue'
import EmojiChart from '@/components/charts/EmojiChart.vue'
import MonthlyHeatmap from '@/components/charts/MonthlyHeatmap.vue'
import CatchphrasesCard from '@/components/analysis/CatchphrasesCard.vue'
import ReplySpeedCard from '@/components/analysis/ReplySpeedCard.vue'
import NightOwlCard from '@/components/analysis/NightOwlCard.vue'
import CompatibilityCard from '@/components/analysis/CompatibilityCard.vue'
import MediaChampionCard from '@/components/analysis/MediaChampionCard.vue'
import ConversationStarterCard from '@/components/analysis/ConversationStarterCard.vue'
import ToolsSection from '@/components/analysis/ToolsSection.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const ui = useUIStore()
const { copyShareUrl } = useShare()

const session = ref<Session | null>(null)
const {
  result, extraStats, wordCloudStats, memberBreakdown, emojiRanking,
  catchphrases, replySpeed, nightOwl, compatibility, mediaChampion, monthlyActivity,
  conversationStarter, analyzing, refiltering, analyze,
} = useAnalysis()
const copied = ref(false)

const filter = ref<DateFilter>({ preset: 'all' })

const hasData = computed(() => result.value && result.value.totalMessages > 0)

onMounted(() => loadSession())

watch(() => route.params.id, () => loadSession())

async function loadSession() {
  const id = Number(route.params.id)
  if (!id) return
  ui.setCurrentSession(id)
  session.value = (await getSession(id)) ?? null
  if (session.value) {
    await analyze(id)
  }
}

function getFilterRange(): { start?: Date; end?: Date } {
  if (filter.value.preset === 'custom') {
    return {
      start: filter.value.start ? new Date(filter.value.start) : undefined,
      end: filter.value.end ? new Date(filter.value.end + 'T23:59:59') : undefined,
    }
  }
  if (filter.value.preset === 'all') return {}
  const now = new Date()
  const map = { week: 7, month: 30, quarter: 90, year: 365 }
  const days = map[filter.value.preset]
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return { start }
}

watch(filter, async () => {
  const id = Number(route.params.id)
  if (!id) return
  const range = getFilterRange()
  await analyze(id, range.start, range.end)
}, { deep: true })

async function handleShare() {
  if (!result.value || !session.value) return
  const ok = await copyShareUrl(session.value.name, session.value.platform, result.value, {
    memberBreakdown: memberBreakdown.value,
    emojiRanking: emojiRanking.value,
    extraStats: extraStats.value ?? undefined,
    catchphrases: catchphrases.value,
    replySpeed: replySpeed.value,
    nightOwl: nightOwl.value,
    compatibility: compatibility.value,
    mediaChampion: mediaChampion.value,
    monthlyActivity: monthlyActivity.value,
    conversationStarter: conversationStarter.value,
  })
  if (ok) {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-light text-gray-800 dark:text-gray-100">
        {{ session?.name ?? t('analysis.title') }}
      </h1>
      <div class="flex gap-2">
        <BaseButton
          v-if="hasData"
          variant="ghost"
          size="sm"
          @click="handleShare"
        >
          {{ copied ? t('common.copied') : t('analysis.share') }}
        </BaseButton>
      </div>
    </div>

    <div v-if="!route.params.id" class="py-20 text-center text-sm text-gray-500 dark:text-gray-400">
      {{ t('analysis.noData') }}
    </div>

    <template v-else>
      <div v-if="analyzing" class="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>

      <template v-else-if="result">
        <div v-if="!hasData" class="py-20 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('analysis.noData') }}
          </p>
          <BaseButton variant="secondary" size="sm" class="mt-4" @click="router.push('/upload')">
            {{ t('nav.upload') }}
          </BaseButton>
        </div>

        <template v-else>
          <StatsSummary :result="result" />

          <!-- Fun Facts -->
          <div v-if="extraStats" class="mt-8">
            <FunFacts :result="result" :extra-stats="extraStats" />
          </div>

          <ToolsSection
            v-if="session?.id"
            :session-id="session.id"
            class="mt-8"
            @members-updated="loadSession()"
          />

          <FilterBar v-model="filter" class="mt-8" />

          <div :class="['mt-8 grid gap-8 transition-opacity duration-200 lg:grid-cols-2', refiltering ? 'pointer-events-none opacity-40' : '']">
            <!-- Activity Trend (full width) -->
            <ActivityTrendChart
              v-if="result.activityByDate.length"
              :data="result.activityByDate"
              class="lg:col-span-2"
            />

            <!-- Peak Hours -->
            <PeakHoursHeatmap :data="result.activityByHourDay" />

            <!-- Member Ranking -->
            <MemberRankingChart
              v-if="result.memberRanking.length"
              :data="result.memberRanking"
            />

            <!-- Word Cloud (full width) -->
            <WordCloudChart
              v-if="result.wordFrequency.length"
              :data="result.wordFrequency"
              :total-messages="wordCloudStats?.totalMessages"
              :total-words="wordCloudStats?.totalWords"
              :unique-words="wordCloudStats?.uniqueWords"
              class="lg:col-span-2"
            />

            <!-- Member Activity Breakdown -->
            <MemberActivityChart
              v-if="memberBreakdown.length"
              :data="memberBreakdown"
            />

            <!-- Message Types -->
            <MessageTypeChart
              v-if="result.messageTypes.length"
              :data="result.messageTypes"
            />

            <!-- Emoji Ranking -->
            <EmojiChart
              v-if="emojiRanking.length"
              :data="emojiRanking"
            />

            <!-- Conversation Starter -->
            <ConversationStarterCard
              v-if="conversationStarter.length"
              :data="conversationStarter"
            />

            <!-- Catchphrases (full width) -->
            <CatchphrasesCard
              v-if="catchphrases.length"
              :data="catchphrases"
              class="lg:col-span-2"
            />

            <!-- Reply Speed -->
            <ReplySpeedCard
              v-if="replySpeed.length"
              :data="replySpeed"
            />

            <!-- Night Owl -->
            <NightOwlCard
              v-if="nightOwl.length"
              :data="nightOwl"
            />

            <!-- Compatibility -->
            <CompatibilityCard
              v-if="compatibility.length"
              :data="compatibility"
            />

            <!-- Media Champion -->
            <MediaChampionCard
              v-if="mediaChampion.length"
              :data="mediaChampion"
            />

            <!-- Monthly Heatmap (full width) -->
            <MonthlyHeatmap
              v-if="monthlyActivity.length"
              :data="monthlyActivity"
              class="lg:col-span-2"
            />
          </div>
        </template>
      </template>
    </template>
  </div>
</template>
