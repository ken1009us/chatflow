export type MessageType = 'text' | 'image' | 'sticker' | 'video' | 'audio' | 'file' | 'call' | 'system'
export type SessionType = 'private' | 'group'
export type Platform = 'line' | 'whatsapp' | 'telegram'

export interface Session {
  id?: number
  platform: Platform
  name: string
  type: SessionType
  memberCount: number
  messageCount: number
  importedAt: Date
}

export interface Member {
  id?: number
  sessionId: number
  name: string
  displayName: string
}

export interface Message {
  id?: number
  sessionId: number
  senderId: number
  content: string
  timestamp: Date
  type: MessageType
}

export interface ParsedChat {
  platform: Platform
  name: string
  type: SessionType
  members: Map<string, string>
  messages: Array<{
    sender: string
    content: string
    timestamp: Date
    type: MessageType
  }>
}

export interface AnalysisResult {
  totalMessages: number
  memberCount: number
  dateRange: { start: Date; end: Date }
  dailyAverage: number
  activityByDate: Array<{ date: string; count: number }>
  activityByHourDay: number[][]
  memberRanking: Array<{ name: string; count: number }>
  messageTypes: Array<{ type: MessageType; count: number }>
  wordFrequency: Array<{ word: string; count: number }>
}

export interface ShareData {
  name: string
  platform: Platform
  totalMessages: number
  memberCount: number
  dateRange: { start: string; end: string }
  dailyAverage: number
  activityByDate: Array<{ date: string; count: number }>
  activityByHourDay: number[][]
  memberRanking: Array<{ name: string; count: number }>
  messageTypes: Array<{ type: string; count: number }>
  wordFrequency: Array<{ word: string; count: number }>
  memberBreakdown?: Array<{ name: string; textCount: number; imageCount: number; stickerCount: number; otherCount: number }>
  emojiRanking?: Array<{ emoji: string; count: number }>
  extraStats?: {
    mostActiveDay: { date: string; count: number }
    longestStreak: number
    avgMessageLength: number
    emojiCount: number
    topEmojis: Array<{ emoji: string; count: number }>
    peakHour: number
    weekendRatio: number
    mostActiveDayOfWeek?: number
    activeDays?: number
    activityRate?: number
  }
  catchphrases?: Array<{ name: string; phrases: Array<{ word: string; count: number; type?: string }> }>
  replySpeed?: Array<{ name: string; avgMinutes: number; totalReplies: number }>
  nightOwl?: Array<{ name: string; nightCount: number; totalCount: number; ratio: number }>
  compatibility?: Array<{ memberA: string; memberB: string; aToB: number; bToA: number; balance: number }>
  mediaChampion?: Array<{ name: string; stickerCount: number; imageCount: number }>
  monthlyActivity?: Array<{ month: string; count: number }>
  conversationStarter?: Array<{ name: string; count: number }>
}