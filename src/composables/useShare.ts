import pako from 'pako'
import type { ShareData, AnalysisResult } from '@/types'
import type {
  MemberBreakdown, ExtraStats, MemberCatchphrases,
  ReplySpeedEntry, NightOwlEntry, CompatibilityPair,
  MediaChampionEntry, MonthlyActivity, ConversationStarterEntry,
} from '@/composables/useAnalysis'
import { useSettingsStore } from '@/stores/settings'

export interface ShareExtras {
  memberBreakdown?: MemberBreakdown[]
  emojiRanking?: Array<{ emoji: string; count: number }>
  extraStats?: ExtraStats
  catchphrases?: MemberCatchphrases[]
  replySpeed?: ReplySpeedEntry[]
  nightOwl?: NightOwlEntry[]
  compatibility?: CompatibilityPair[]
  mediaChampion?: MediaChampionEntry[]
  monthlyActivity?: MonthlyActivity[]
  conversationStarter?: ConversationStarterEntry[]
}

export function useShare() {
  function buildShareData(name: string, platform: string, result: AnalysisResult, extras?: ShareExtras): ShareData {
    return {
      name,
      platform: platform as ShareData['platform'],
      totalMessages: result.totalMessages,
      memberCount: result.memberCount,
      dateRange: {
        start: result.dateRange.start.toISOString(),
        end: result.dateRange.end.toISOString(),
      },
      dailyAverage: result.dailyAverage,
      activityByDate: result.activityByDate,
      activityByHourDay: result.activityByHourDay,
      memberRanking: result.memberRanking.slice(0, 10),
      messageTypes: result.messageTypes,
      wordFrequency: result.wordFrequency.slice(0, 100),
      memberBreakdown: extras?.memberBreakdown?.slice(0, 10),
      emojiRanking: extras?.emojiRanking?.slice(0, 10),
      extraStats: extras?.extraStats,
      catchphrases: extras?.catchphrases?.slice(0, 10),
      replySpeed: extras?.replySpeed?.slice(0, 10),
      nightOwl: extras?.nightOwl?.slice(0, 10),
      compatibility: extras?.compatibility?.slice(0, 5),
      mediaChampion: extras?.mediaChampion?.slice(0, 10),
      monthlyActivity: extras?.monthlyActivity,
      conversationStarter: extras?.conversationStarter?.slice(0, 10),
    }
  }

  /** Legacy: decode hash-based share URL */
  function decodeShareData(encoded: string): ShareData {
    const binary = atob(encoded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const decompressed = pako.inflate(bytes)
    const json = new TextDecoder().decode(decompressed)
    return JSON.parse(json)
  }

  /** Fetch share data by short ID from API */
  async function fetchShareData(id: string): Promise<ShareData | null> {
    try {
      const response = await fetch(`/api/share?id=${encodeURIComponent(id)}`)
      if (!response.ok) return null
      return await response.json()
    } catch {
      return null
    }
  }

  /** Create a short share URL via API, fallback to hash URL for local dev */
  async function copyShareUrl(name: string, platform: string, result: AnalysisResult, extras?: ShareExtras): Promise<boolean> {
    try {
      const shareData = buildShareData(name, platform, result, extras)

      const settings = useSettingsStore()
      const lang = settings.locale

      // Try API (production)
      try {
        const response = await fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shareData),
        })
        if (response.ok) {
          const { id } = await response.json()
          const url = `${window.location.origin}/s/${id}?lang=${lang}`
          await navigator.clipboard.writeText(url)
          return true
        }
      } catch {
        // API not available (local dev), fall through to hash fallback
      }

      // Fallback: hash-based URL
      const json = JSON.stringify(shareData)
      const compressed = pako.deflate(new TextEncoder().encode(json))
      const encoded = btoa(String.fromCharCode(...compressed))
      const url = `${window.location.origin}/shared?lang=${lang}#${encoded}`
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      return false
    }
  }

  return { decodeShareData, fetchShareData, copyShareUrl }
}
