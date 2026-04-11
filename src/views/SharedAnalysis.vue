<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useShare } from '@/composables/useShare'
import type { ShareData } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatsSummary from '@/components/analysis/StatsSummary.vue'
import ActivityTrendChart from '@/components/charts/ActivityTrendChart.vue'
import PeakHoursHeatmap from '@/components/charts/PeakHoursHeatmap.vue'
import MemberRankingChart from '@/components/charts/MemberRankingChart.vue'
import MemberActivityChart from '@/components/charts/MemberActivityChart.vue'
import MessageTypeChart from '@/components/charts/MessageTypeChart.vue'
import WordCloudChart from '@/components/charts/WordCloudChart.vue'
import EmojiChart from '@/components/charts/EmojiChart.vue'
import MonthlyHeatmap from '@/components/charts/MonthlyHeatmap.vue'
import FunFacts from '@/components/analysis/FunFacts.vue'
import CatchphrasesCard from '@/components/analysis/CatchphrasesCard.vue'
import ReplySpeedCard from '@/components/analysis/ReplySpeedCard.vue'
import NightOwlCard from '@/components/analysis/NightOwlCard.vue'
import CompatibilityCard from '@/components/analysis/CompatibilityCard.vue'
import MediaChampionCard from '@/components/analysis/MediaChampionCard.vue'

const { t, locale: i18nLocale } = useI18n()
const router = useRouter()
const route = useRoute()
const { decodeShareData, fetchShareData } = useShare()

const data = ref<ShareData | null>(null)
const loading = ref(false)
const invalid = ref(false)

const SUPPORTED_LOCALES = ['ja', 'zh-TW', 'en']

onMounted(async () => {
  const lang = route.query.lang as string | undefined
  if (lang && SUPPORTED_LOCALES.includes(lang)) {
    i18nLocale.value = lang
  }

  const id = route.params.id as string | undefined

  if (id) {
    // Short URL: /s/{id} — fetch from API
    loading.value = true
    data.value = await fetchShareData(id)
    loading.value = false
    if (!data.value) invalid.value = true
    return
  }

  // Legacy hash URL: /shared#{encoded}
  const hash = window.location.hash.slice(1)
  if (!hash) {
    router.replace('/')
    return
  }
  try {
    data.value = decodeShareData(hash)
  } catch {
    invalid.value = true
  }
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Invalid -->
    <div v-else-if="invalid" class="py-20 text-center">
      <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('shared.invalid') }}</p>
    </div>

    <!-- Share data display -->
    <template v-else-if="data">
      <div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-center text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        {{ t('shared.notice') }}
      </div>

      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-xl font-light text-gray-800 dark:text-gray-100">
          {{ data.name }}
        </h1>
      </div>

      <StatsSummary
        :result="{
          totalMessages: data.totalMessages,
          memberCount: data.memberCount,
          dateRange: { start: new Date(data.dateRange.start), end: new Date(data.dateRange.end) },
          dailyAverage: data.dailyAverage,
          activityByDate: data.activityByDate,
          activityByHourDay: data.activityByHourDay,
          memberRanking: data.memberRanking,
          messageTypes: data.messageTypes as any,
          wordFrequency: data.wordFrequency,
        }"
      />

      <!-- Fun Facts -->
      <div v-if="data.extraStats" class="mt-4">
        <FunFacts
          :result="{
            totalMessages: data.totalMessages,
            memberCount: data.memberCount,
            dateRange: { start: new Date(data.dateRange.start), end: new Date(data.dateRange.end) },
            dailyAverage: data.dailyAverage,
            activityByDate: data.activityByDate,
            activityByHourDay: data.activityByHourDay,
            memberRanking: data.memberRanking,
            messageTypes: data.messageTypes as any,
            wordFrequency: data.wordFrequency,
          }"
          :extra-stats="data.extraStats"
        />
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-2">
        <!-- Activity Trend (full width) -->
        <ActivityTrendChart
          v-if="data.activityByDate.length"
          :data="data.activityByDate"
          class="lg:col-span-2"
        />

        <!-- Peak Hours -->
        <PeakHoursHeatmap :data="data.activityByHourDay" />

        <!-- Member Ranking -->
        <MemberRankingChart
          v-if="data.memberRanking.length"
          :data="data.memberRanking"
        />

        <!-- Word Cloud (full width) -->
        <WordCloudChart
          v-if="data.wordFrequency.length"
          :data="data.wordFrequency"
          class="lg:col-span-2"
        />

        <!-- Member Activity Breakdown -->
        <MemberActivityChart
          v-if="data.memberBreakdown?.length"
          :data="data.memberBreakdown"
        />

        <!-- Message Types -->
        <MessageTypeChart
          v-if="data.messageTypes.length"
          :data="data.messageTypes as any"
        />

        <!-- Emoji Ranking -->
        <EmojiChart
          v-if="data.emojiRanking?.length"
          :data="data.emojiRanking"
        />

        <!-- Catchphrases (full width) -->
        <CatchphrasesCard
          v-if="data.catchphrases?.length"
          :data="data.catchphrases"
          class="lg:col-span-2"
        />

        <!-- Reply Speed -->
        <ReplySpeedCard
          v-if="data.replySpeed?.length"
          :data="data.replySpeed"
        />

        <!-- Night Owl -->
        <NightOwlCard
          v-if="data.nightOwl?.length"
          :data="data.nightOwl"
        />

        <!-- Compatibility -->
        <CompatibilityCard
          v-if="data.compatibility?.length"
          :data="data.compatibility"
        />

        <!-- Media Champion -->
        <MediaChampionCard
          v-if="data.mediaChampion?.length"
          :data="data.mediaChampion"
        />

        <!-- Monthly Heatmap (full width) -->
        <MonthlyHeatmap
          v-if="data.monthlyActivity?.length"
          :data="data.monthlyActivity"
          class="lg:col-span-2"
        />
      </div>

      <!-- TODO: 試用期結束後恢復 openApp 按鈕 -->
    </template>
  </div>
</template>
