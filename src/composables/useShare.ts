import pako from 'pako'
import type { ShareData, AnalysisResult } from '@/types'
import type {
  MemberBreakdown, ExtraStats, MemberCatchphrases,
  ReplySpeedEntry, NightOwlEntry, CompatibilityPair,
  MediaChampionEntry, MonthlyActivity,
} from '@/composables/useAnalysis'

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
}

export function useShare() {
  function encodeShareData(name: string, platform: string, result: AnalysisResult, extras?: ShareExtras): string {
    const shareData: ShareData = {
      name,
      platform: platform as ShareData['platform'],
      totalMessages: result.totalMessages,
      memberCount: result.memberCount,
      dateRange: {
        start: result.dateRange.start.toISOString(),
        end: result.dateRange.end.toISOString(),
      },
      dailyAverage: result.dailyAverage,
      activityByDate: result.activityByDate.slice(-90),
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
    }

    const json = JSON.stringify(shareData)
    const compressed = pako.deflate(new TextEncoder().encode(json))
    return btoa(String.fromCharCode(...compressed))
  }

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

  async function copyShareUrl(name: string, platform: string, result: AnalysisResult, extras?: ShareExtras): Promise<boolean> {
    try {
      const encoded = encodeShareData(name, platform, result, extras)
      const url = `${window.location.origin}/shared#${encoded}`
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      return false
    }
  }

  return { encodeShareData, decodeShareData, copyShareUrl }
}
