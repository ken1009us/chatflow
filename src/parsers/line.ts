import type { ChatParser } from './base'
import type { ParsedChat, MessageType } from '@/types'

// Real LINE export formats:
//
// Header:    [LINE] 台日諮商室のトーク履歴
// Save date: 保存日時：R8/04/11 20:01
//
// Date line (Japanese era):  R7/02/09(日)
// Date line (Western):       2024/01/14(Mon) or 2024/01/14（月）
//
// Messages use SPACES (often 4) as separator, not just tabs:
//   15:18    ケン    [写真]
//   下午3:18    Alice    你好
//
// System messages have no sender:
//   19:31        梁毓麟yulinがメッセージの送信を取り消しました

// Japanese era mapping
const ERA_MAP: Record<string, number> = {
  'R': 2018, // Reiwa: R1 = 2019, so base = 2018
  '令': 2018,
  'H': 1988, // Heisei: H1 = 1989
  '平': 1988,
}

// Date line — support era years (R7/02/09) and western years (2024/01/14)
// Support both () and （）, 1-2 digit month/day
const DATE_WESTERN_RE = /^(\d{4})\/(\d{1,2})\/(\d{1,2})\s*[（(](.+?)[）)]/
const DATE_ERA_RE = /^([A-Z令平])(\d{1,2})\/(\d{1,2})\/(\d{1,2})\s*[（(](.+?)[）)]/

// Message line — separator can be tab OR multiple spaces (2+)
// Optional AM/PM prefix (上午/下午/午前/午後)
const MESSAGE_RE = /^(?:上午|下午|午前|午後)?\s*(\d{1,2}):(\d{2})(?:\s*(?:AM|PM|am|pm))?(?:\t| {2,})(.+?)(?:\t| {2,})(.+)/

// For AM/PM detection
const PM_PREFIX_RE = /^(下午|午後)/
const AM_PREFIX_RE = /^(上午|午前)/
const PM_SUFFIX_RE = /\d{2}\s*PM/i
const AM_SUFFIX_RE = /\d{2}\s*AM/i

// For detecting time-starting lines (messages or system messages)
const TIME_START_RE = /^(?:上午|下午|午前|午後)?\s*(\d{1,2}):(\d{2})/

const HEADER_RE = /^\[LINE\]/

const TYPE_PATTERNS: Array<[RegExp, MessageType]> = [
  [/^\[写真\]$|^\[照片\]$|^\[Photo\]$|^\[画像\]$/i, 'image'],
  [/^\[スタンプ\]|^\[貼圖\]|^\[Sticker\]/i, 'sticker'],
  [/^\[動画\]$|^\[影片\]$|^\[Video\]$/i, 'video'],
  [/^\[音声メッセージ\]$|^\[語音訊息\]$|^\[Audio\]$/i, 'audio'],
  [/^\[ファイル\]$|^\[檔案\]$|^\[File\]$/i, 'file'],
  [/☎|通話時間|通話|☎ 通話/i, 'call'],
  // LINE emoji / sticker names in parentheses: (machiko), (celebrate)
  [/^\([a-zA-Z0-9_ -]+\)$/, 'sticker'],
]

function detectMessageType(content: string): MessageType {
  for (const [pattern, type] of TYPE_PATTERNS) {
    if (pattern.test(content.trim())) return type
  }
  return 'text'
}

function adjustHour(hour: number, rawLine: string): number {
  const isPM = PM_PREFIX_RE.test(rawLine) || PM_SUFFIX_RE.test(rawLine)
  const isAM = AM_PREFIX_RE.test(rawLine) || AM_SUFFIX_RE.test(rawLine)

  if (isPM && hour < 12) return hour + 12
  if (isAM && hour === 12) return 0
  return hour
}

function normalizeContent(content: string): string {
  return content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

function parseDateLine(line: string): { year: number; month: number; day: number } | null {
  // Try western format first: 2024/01/14(Mon)
  const western = line.match(DATE_WESTERN_RE)
  if (western) {
    return {
      year: parseInt(western[1]),
      month: parseInt(western[2]),
      day: parseInt(western[3]),
    }
  }

  // Try Japanese era format: R7/02/09(日)
  const era = line.match(DATE_ERA_RE)
  if (era) {
    const eraChar = era[1]
    const eraYear = parseInt(era[2])
    const baseYear = ERA_MAP[eraChar]
    if (baseYear) {
      return {
        year: baseYear + eraYear,
        month: parseInt(era[3]),
        day: parseInt(era[4]),
      }
    }
  }

  return null
}

function isDateLine(line: string): boolean {
  return DATE_WESTERN_RE.test(line) || DATE_ERA_RE.test(line)
}

export const lineParser: ChatParser = {
  platform: 'line',

  canParse(content: string): boolean {
    const normalized = normalizeContent(content)
    const lines = normalized.split('\n').slice(0, 20)
    const hasHeader = lines.some((l) => HEADER_RE.test(l))
    const hasDate = lines.some((l) => isDateLine(l))
    const hasMessage = lines.some((l) => MESSAGE_RE.test(l))
    return hasHeader || (hasDate && hasMessage)
  },

  parse(content: string): ParsedChat {
    const normalized = normalizeContent(content)
    const lines = normalized.split('\n')
    const members = new Map<string, string>()
    const messages: ParsedChat['messages'] = []

    let chatName = ''
    let currentYear = 0
    let currentMonth = 0
    let currentDay = 0
    let hasDate = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Skip empty lines
      if (!line.trim()) continue

      // Header line
      if (HEADER_RE.test(line)) {
        const afterTag = line.replace(/^\[LINE\]\s*/, '').trim()
        chatName = afterTag
        continue
      }

      // Date line
      const dateInfo = parseDateLine(line)
      if (dateInfo) {
        currentYear = dateInfo.year
        currentMonth = dateInfo.month
        currentDay = dateInfo.day
        hasDate = true
        continue
      }

      // Message line
      if (!hasDate) continue

      const msgMatch = line.match(MESSAGE_RE)
      if (msgMatch) {
        let hour = parseInt(msgMatch[1])
        const minute = parseInt(msgMatch[2])
        const sender = msgMatch[3].trim()
        let messageContent = msgMatch[4].trim()

        // Adjust for AM/PM
        hour = adjustHour(hour, line)

        // Merge multi-line messages: continuation lines that don't start with
        // a time pattern and aren't date lines
        while (
          i + 1 < lines.length &&
          lines[i + 1] !== '' &&
          !TIME_START_RE.test(lines[i + 1]) &&
          !isDateLine(lines[i + 1]) &&
          !HEADER_RE.test(lines[i + 1])
        ) {
          i++
          messageContent += '\n' + lines[i]
        }

        if (!members.has(sender)) {
          members.set(sender, sender)
        }

        const timestamp = new Date(currentYear, currentMonth - 1, currentDay, hour, minute)
        const type = detectMessageType(messageContent)

        messages.push({ sender, content: messageContent, timestamp, type })
      }
    }

    if (!chatName && members.size > 0) {
      chatName = Array.from(members.keys()).join(', ')
    }

    const isGroup = members.size > 2
    return {
      platform: 'line',
      name: chatName || 'LINE Chat',
      type: isGroup ? 'group' : 'private',
      members,
      messages,
    }
  },
}
