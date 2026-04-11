import { ref } from 'vue'
import type { AnalysisResult, Message } from '@/types'
import { getAllMessagesForAnalysis, getMembers } from '@/db/queries'
import { STOP_WORDS } from '@/utils/stopwords'

export interface ExtraStats {
  mostActiveDay: { date: string; count: number }
  longestStreak: number
  avgMessageLength: number
  emojiCount: number
  topEmojis: Array<{ emoji: string; count: number }>
  peakHour: number
  weekendRatio: number
}

export interface MemberBreakdown {
  name: string
  textCount: number
  imageCount: number
  stickerCount: number
  otherCount: number
}

export interface MemberCatchphrases {
  name: string
  phrases: Array<{ word: string; count: number }>
}

export interface ReplySpeedEntry {
  name: string
  avgMinutes: number
  totalReplies: number
}

export interface NightOwlEntry {
  name: string
  nightCount: number
  totalCount: number
  ratio: number
}

export interface CompatibilityPair {
  memberA: string
  memberB: string
  aToB: number
  bToA: number
  balance: number
}

export interface MediaChampionEntry {
  name: string
  stickerCount: number
  imageCount: number
}

export interface MonthlyActivity {
  month: string
  count: number
}

export function useAnalysis() {
  const result = ref<AnalysisResult | null>(null)
  const extraStats = ref<ExtraStats | null>(null)
  const memberBreakdown = ref<MemberBreakdown[]>([])
  const emojiRanking = ref<Array<{ emoji: string; count: number }>>([])
  const catchphrases = ref<MemberCatchphrases[]>([])
  const replySpeed = ref<ReplySpeedEntry[]>([])
  const nightOwl = ref<NightOwlEntry[]>([])
  const compatibility = ref<CompatibilityPair[]>([])
  const mediaChampion = ref<MediaChampionEntry[]>([])
  const monthlyActivity = ref<MonthlyActivity[]>([])
  const analyzing = ref(false)
  const refiltering = ref(false)

  async function analyze(sessionId: number, start?: Date, end?: Date) {
    if (result.value) {
      refiltering.value = true
    } else {
      analyzing.value = true
    }
    try {
      let messages = await getAllMessagesForAnalysis(sessionId)
      const members = await getMembers(sessionId)
      const memberMap = new Map(members.map((m) => [m.id!, m.displayName]))

      if (start) messages = messages.filter((m) => m.timestamp >= start)
      if (end) messages = messages.filter((m) => m.timestamp <= end)

      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

      result.value = computeAnalysis(messages, memberMap)
      extraStats.value = computeExtraStats(messages)
      memberBreakdown.value = computeMemberBreakdown(messages, memberMap)
      emojiRanking.value = extraStats.value.topEmojis
      catchphrases.value = computeCatchphrases(messages, memberMap)
      replySpeed.value = computeReplySpeed(messages, memberMap)
      nightOwl.value = computeNightOwl(messages, memberMap)
      compatibility.value = computeCompatibility(messages, memberMap)
      mediaChampion.value = computeMediaChampion(messages, memberMap)
      monthlyActivity.value = computeMonthlyActivity(messages)
    } finally {
      analyzing.value = false
      refiltering.value = false
    }
  }

  return {
    result, extraStats, memberBreakdown, emojiRanking,
    catchphrases, replySpeed, nightOwl, compatibility, mediaChampion, monthlyActivity,
    refiltering, analyzing, analyze,
  }
}

function computeAnalysis(
  messages: Message[],
  memberMap: Map<number, string>
): AnalysisResult {
  if (messages.length === 0) {
    return {
      totalMessages: 0,
      memberCount: memberMap.size,
      dateRange: { start: new Date(), end: new Date() },
      dailyAverage: 0,
      activityByDate: [],
      activityByHourDay: Array.from({ length: 7 }, () => Array(24).fill(0)),
      memberRanking: [],
      messageTypes: [],
      wordFrequency: [],
    }
  }

  const totalMessages = messages.length
  const memberCount = memberMap.size
  const dateRange = {
    start: messages[0].timestamp,
    end: messages[messages.length - 1].timestamp,
  }
  const daysDiff = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)))
  const dailyAverage = totalMessages / daysDiff

  // Activity by date (fill all dates in range, 0 for days without messages)
  const dateCountMap = new Map<string, number>()
  for (const m of messages) {
    const key = m.timestamp.toISOString().slice(0, 10)
    dateCountMap.set(key, (dateCountMap.get(key) ?? 0) + 1)
  }
  const activityByDate: Array<{ date: string; count: number }> = []
  const cursor = new Date(dateRange.start)
  cursor.setHours(0, 0, 0, 0)
  const endDate = new Date(dateRange.end)
  endDate.setHours(0, 0, 0, 0)
  while (cursor <= endDate) {
    const key = cursor.toISOString().slice(0, 10)
    activityByDate.push({ date: key, count: dateCountMap.get(key) ?? 0 })
    cursor.setDate(cursor.getDate() + 1)
  }

  // Peak hours heatmap: 7 days x 24 hours
  const activityByHourDay: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  for (const m of messages) {
    const day = (m.timestamp.getDay() + 6) % 7 // Mon=0
    const hour = m.timestamp.getHours()
    activityByHourDay[day][hour]++
  }

  // Member ranking
  const memberCounts = new Map<number, number>()
  for (const m of messages) {
    memberCounts.set(m.senderId, (memberCounts.get(m.senderId) ?? 0) + 1)
  }
  const memberRanking = Array.from(memberCounts.entries())
    .map(([id, count]) => ({ name: memberMap.get(id) ?? 'Unknown', count }))
    .sort((a, b) => b.count - a.count)

  // Message types
  const typeCounts = new Map<string, number>()
  for (const m of messages) {
    typeCounts.set(m.type, (typeCounts.get(m.type) ?? 0) + 1)
  }
  const messageTypes = Array.from(typeCounts.entries())
    .map(([type, count]) => ({ type: type as any, count }))
    .sort((a, b) => b.count - a.count)

  // Word frequency
  const memberNamesList = Array.from(memberMap.values())
  const wordCounts = new Map<string, number>()
  for (const m of messages) {
    if (m.type !== 'text') continue
    const words = tokenize(m.content, memberNamesList)
    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1)
    }
  }
  const wordFrequency = Array.from(wordCounts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 150)

  return {
    totalMessages,
    memberCount,
    dateRange,
    dailyAverage,
    activityByDate,
    activityByHourDay,
    memberRanking,
    messageTypes,
    wordFrequency,
  }
}

function computeExtraStats(messages: Message[]): ExtraStats {
  if (messages.length === 0) {
    return {
      mostActiveDay: { date: '', count: 0 },
      longestStreak: 0,
      avgMessageLength: 0,
      emojiCount: 0,
      topEmojis: [],
      peakHour: 0,
      weekendRatio: 0,
    }
  }

  // Most active day
  const dateCounts = new Map<string, number>()
  for (const m of messages) {
    const key = m.timestamp.toISOString().slice(0, 10)
    dateCounts.set(key, (dateCounts.get(key) ?? 0) + 1)
  }
  let mostActiveDay = { date: '', count: 0 }
  for (const [date, count] of dateCounts) {
    if (count > mostActiveDay.count) mostActiveDay = { date, count }
  }

  // Longest consecutive chat streak
  const sortedDates = Array.from(dateCounts.keys()).sort()
  let longestStreak = 1
  let currentStreak = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1])
    const curr = new Date(sortedDates[i])
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  // Avg message length (text only)
  const textMessages = messages.filter((m) => m.type === 'text')
  const totalLength = textMessages.reduce((sum, m) => sum + m.content.length, 0)
  const avgMessageLength = textMessages.length > 0 ? Math.round(totalLength / textMessages.length) : 0

  // Emojis
  const emojiCounts = new Map<string, number>()
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu
  let emojiCount = 0
  for (const m of messages) {
    const emojis = m.content.match(emojiRegex)
    if (emojis) {
      emojiCount += emojis.length
      for (const e of emojis) {
        emojiCounts.set(e, (emojiCounts.get(e) ?? 0) + 1)
      }
    }
  }
  const topEmojis = Array.from(emojiCounts.entries())
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  // Peak hour (hour with most messages)
  const hourCounts = new Array(24).fill(0)
  for (const m of messages) {
    hourCounts[m.timestamp.getHours()]++
  }
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts))

  // Weekend ratio
  const weekendMessages = messages.filter((m) => {
    const day = m.timestamp.getDay()
    return day === 0 || day === 6
  })
  const weekendRatio = messages.length > 0 ? weekendMessages.length / messages.length : 0

  return {
    mostActiveDay,
    longestStreak,
    avgMessageLength,
    emojiCount,
    topEmojis,
    peakHour,
    weekendRatio,
  }
}

function computeMemberBreakdown(
  messages: Message[],
  memberMap: Map<number, string>
): MemberBreakdown[] {
  const breakdown = new Map<number, MemberBreakdown>()

  for (const m of messages) {
    if (!breakdown.has(m.senderId)) {
      breakdown.set(m.senderId, {
        name: memberMap.get(m.senderId) ?? 'Unknown',
        textCount: 0,
        imageCount: 0,
        stickerCount: 0,
        otherCount: 0,
      })
    }
    const entry = breakdown.get(m.senderId)!
    switch (m.type) {
      case 'text': entry.textCount++; break
      case 'image': entry.imageCount++; break
      case 'sticker': entry.stickerCount++; break
      default: entry.otherCount++; break
    }
  }

  return Array.from(breakdown.values())
}

// --- New Analysis Functions ---

function computeCatchphrases(
  messages: Message[],
  memberMap: Map<number, string>
): MemberCatchphrases[] {
  const memberNamesList = Array.from(memberMap.values())
  const memberWords = new Map<number, Map<string, number>>()

  for (const m of messages) {
    if (m.type !== 'text') continue
    if (!memberWords.has(m.senderId)) {
      memberWords.set(m.senderId, new Map())
    }
    const words = tokenize(m.content, memberNamesList)
    const wordMap = memberWords.get(m.senderId)!
    for (const w of words) {
      wordMap.set(w, (wordMap.get(w) ?? 0) + 1)
    }
  }

  return Array.from(memberWords.entries())
    .map(([id, wordMap]) => ({
      name: memberMap.get(id) ?? 'Unknown',
      phrases: Array.from(wordMap.entries())
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    }))
    .sort((a, b) => {
      const aTop = a.phrases[0]?.count ?? 0
      const bTop = b.phrases[0]?.count ?? 0
      return bTop - aTop
    })
}

function computeReplySpeed(
  messages: Message[],
  memberMap: Map<number, string>
): ReplySpeedEntry[] {
  const replyTimes = new Map<number, number[]>()

  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1]
    const curr = messages[i]
    if (curr.senderId === prev.senderId) continue

    const diffMin = (curr.timestamp.getTime() - prev.timestamp.getTime()) / (1000 * 60)
    if (diffMin > 720) continue // ignore gaps > 12 hours

    if (!replyTimes.has(curr.senderId)) {
      replyTimes.set(curr.senderId, [])
    }
    replyTimes.get(curr.senderId)!.push(diffMin)
  }

  return Array.from(replyTimes.entries())
    .map(([id, times]) => ({
      name: memberMap.get(id) ?? 'Unknown',
      avgMinutes: times.reduce((s, t) => s + t, 0) / times.length,
      totalReplies: times.length,
    }))
    .sort((a, b) => a.avgMinutes - b.avgMinutes)
}

function computeNightOwl(
  messages: Message[],
  memberMap: Map<number, string>
): NightOwlEntry[] {
  const counts = new Map<number, { night: number; total: number }>()

  for (const m of messages) {
    if (!counts.has(m.senderId)) {
      counts.set(m.senderId, { night: 0, total: 0 })
    }
    const entry = counts.get(m.senderId)!
    entry.total++
    const hour = m.timestamp.getHours()
    if (hour >= 0 && hour < 5) {
      entry.night++
    }
  }

  return Array.from(counts.entries())
    .map(([id, { night, total }]) => ({
      name: memberMap.get(id) ?? 'Unknown',
      nightCount: night,
      totalCount: total,
      ratio: total > 0 ? night / total : 0,
    }))
    .sort((a, b) => b.ratio - a.ratio)
}

function computeCompatibility(
  messages: Message[],
  memberMap: Map<number, string>
): CompatibilityPair[] {
  const pairCounts = new Map<string, number>()

  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1]
    const curr = messages[i]
    if (curr.senderId === prev.senderId) continue
    const diffMs = curr.timestamp.getTime() - prev.timestamp.getTime()
    if (diffMs > 12 * 60 * 60 * 1000) continue

    const key = `${prev.senderId}->${curr.senderId}`
    pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1)
  }

  const memberIds = Array.from(memberMap.keys())
  const pairs: CompatibilityPair[] = []

  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      const a = memberIds[i]
      const b = memberIds[j]
      const aToB = pairCounts.get(`${a}->${b}`) ?? 0
      const bToA = pairCounts.get(`${b}->${a}`) ?? 0
      const total = aToB + bToA
      if (total === 0) continue

      pairs.push({
        memberA: memberMap.get(a) ?? 'Unknown',
        memberB: memberMap.get(b) ?? 'Unknown',
        aToB,
        bToA,
        balance: 1 - Math.abs(aToB - bToA) / total,
      })
    }
  }

  return pairs.sort((a, b) => (b.aToB + b.bToA) - (a.aToB + a.bToA)).slice(0, 5)
}

function computeMediaChampion(
  messages: Message[],
  memberMap: Map<number, string>
): MediaChampionEntry[] {
  const counts = new Map<number, { sticker: number; image: number }>()

  for (const m of messages) {
    if (m.type !== 'sticker' && m.type !== 'image') continue
    if (!counts.has(m.senderId)) {
      counts.set(m.senderId, { sticker: 0, image: 0 })
    }
    const entry = counts.get(m.senderId)!
    if (m.type === 'sticker') entry.sticker++
    else entry.image++
  }

  return Array.from(counts.entries())
    .map(([id, { sticker, image }]) => ({
      name: memberMap.get(id) ?? 'Unknown',
      stickerCount: sticker,
      imageCount: image,
    }))
    .sort((a, b) => (b.stickerCount + b.imageCount) - (a.stickerCount + a.imageCount))
}

function computeMonthlyActivity(messages: Message[]): MonthlyActivity[] {
  const counts = new Map<string, number>()
  for (const m of messages) {
    const key = m.timestamp.toISOString().slice(0, 7)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

// --- Tokenizer ---

// Pure hiragana check: most 1-2 char pure-hiragana segments are particles/endings
const HIRAGANA_RE = /^[\u3040-\u309f]+$/
const KATAKANA_RE = /^[\u30a0-\u30ff]+$/

function tokenize(text: string, memberNames?: string[]): string[] {
  const cleaned = text.replace(/https?:\/\/\S+/g, '')
  const tokens: string[] = []

  // Build member name filters
  const memberNamesLower = new Set<string>()
  const cjkMemberNames: string[] = []
  if (memberNames) {
    for (const name of memberNames) {
      memberNamesLower.add(name.toLowerCase())
      const latinParts = name.toLowerCase().match(/[a-z]{3,}/g)
      if (latinParts) {
        for (const p of latinParts) memberNamesLower.add(p)
      }
      const cjkParts = name.match(/[\u3000-\u9fff\uf900-\ufaff]+/g)
      if (cjkParts) {
        for (const p of cjkParts) {
          if (p.length >= 2) cjkMemberNames.push(p)
        }
      }
    }
  }

  // Latin words (3+ chars, filter stop words and member names)
  const latinWords = cleaned.toLowerCase().match(/[a-zA-Z]{3,}/g)
  if (latinWords) {
    for (const w of latinWords) {
      if (!STOP_WORDS.has(w) && !memberNamesLower.has(w)) tokens.push(w)
    }
  }

  // CJK processing: strip member names from text before segmenting
  let cjkText = cleaned
  const sortedNames = [...cjkMemberNames].sort((a, b) => b.length - a.length)
  for (const name of sortedNames) {
    while (cjkText.includes(name)) {
      cjkText = cjkText.replace(name, ' ')
    }
  }

  // CJK: prefer Intl.Segmenter for proper word segmentation
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const hasJa = /[\u3040-\u309f\u30a0-\u30ff]/.test(cjkText)
    const lang = hasJa ? 'ja' : 'zh-TW'
    const segmenter = new Intl.Segmenter(lang, { granularity: 'word' })
    for (const { segment, isWordLike } of segmenter.segment(cjkText)) {
      if (!isWordLike) continue
      if (STOP_WORDS.has(segment)) continue
      // Pure hiragana: require 3+ chars (1-2 char hiragana are almost always particles)
      if (HIRAGANA_RE.test(segment) && segment.length < 3) continue
      // Katakana: require 2+ chars
      if (KATAKANA_RE.test(segment) && segment.length < 2) continue
      // Mixed/kanji: require 2+ chars
      if (segment.length < 2) continue
      tokens.push(segment)
    }
  } else {
    // Fallback: CJK bigrams from remaining contiguous segments
    const cjkSegments = cjkText.match(/[\u3000-\u9fff\uf900-\ufaff]+/g)
    if (cjkSegments) {
      for (const segment of cjkSegments) {
        if (segment.length >= 2) {
          for (let i = 0; i < segment.length - 1; i++) {
            const bigram = segment[i] + segment[i + 1]
            if (!STOP_WORDS.has(bigram)) tokens.push(bigram)
          }
        }
      }
    }
  }

  return tokens
}
