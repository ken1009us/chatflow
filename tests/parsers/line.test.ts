import { describe, it, expect } from 'vitest'
import { lineParser } from '@/parsers/line'

// Standard Western date format with tab separator
const SAMPLE_WESTERN = `[LINE] Chat history with Alice
Save date: 2024/01/15

2024/01/14(Sun)
10:30\tAlice\tHello!
10:31\tBob\tHi there!
10:32\tAlice\tHow are you?
10:33\tBob\tI'm good, thanks!
10:34\tAlice\t[照片]
10:35\tBob\t[貼圖]

2024/01/15(Mon)
09:00\tAlice\tGood morning
09:01\tBob\tMorning!
09:02\tAlice\tLet's meet at 3pm
This is a multi-line message
with more details
09:05\tBob\tSounds good!
`

// Japanese era date format with space separator (real LINE export)
const SAMPLE_ERA = `[LINE] 台日諮商室のトーク履歴
保存日時：R8/04/11 20:01

R7/02/09(日)
15:18    ケン    [写真]
15:18    ケン    猜跟誰
15:34    陳柏翰    我在我家…
15:42    謝汶諺Wilson    昂⋯
16:35    陳柏翰    [写真]

R7/02/11(火)
19:12    梁毓麟yulin    [写真]
19:30    ケン    明天？
19:31    梁毓麟yulin    書狗
20:26    ケン    明治神宮夠大嗎
20:39    陳柏翰    [スタンプ]
`

// Chinese AM/PM format with full-width parentheses
const SAMPLE_CHINESE = `[LINE] 與Alice的聊天記錄

2024/01/14（一）
下午3:18    Alice    你好
下午3:19    Bob    嗨！
上午10:30    Alice    早安
`

describe('LINE Parser — Western format', () => {
  it('detects LINE format', () => {
    expect(lineParser.canParse(SAMPLE_WESTERN)).toBe(true)
  })

  it('parses chat name', () => {
    const result = lineParser.parse(SAMPLE_WESTERN)
    expect(result.name).toBe('Chat history with Alice')
  })

  it('identifies members', () => {
    const result = lineParser.parse(SAMPLE_WESTERN)
    expect(result.members.size).toBe(2)
    expect(result.members.has('Alice')).toBe(true)
    expect(result.members.has('Bob')).toBe(true)
  })

  it('parses correct number of messages', () => {
    const result = lineParser.parse(SAMPLE_WESTERN)
    expect(result.messages.length).toBe(10)
  })

  it('parses timestamps correctly', () => {
    const result = lineParser.parse(SAMPLE_WESTERN)
    const first = result.messages[0]
    expect(first.timestamp.getFullYear()).toBe(2024)
    expect(first.timestamp.getMonth()).toBe(0) // January
    expect(first.timestamp.getDate()).toBe(14)
    expect(first.timestamp.getHours()).toBe(10)
    expect(first.timestamp.getMinutes()).toBe(30)
  })

  it('detects message types', () => {
    const result = lineParser.parse(SAMPLE_WESTERN)
    const types = result.messages.map((m) => m.type)
    expect(types.filter((t) => t === 'text').length).toBe(8)
    expect(types.filter((t) => t === 'image').length).toBe(1)
    expect(types.filter((t) => t === 'sticker').length).toBe(1)
  })

  it('merges multi-line messages', () => {
    const result = lineParser.parse(SAMPLE_WESTERN)
    const multiLine = result.messages.find((m) => m.content.includes('multi-line'))
    expect(multiLine).toBeDefined()
    expect(multiLine!.content).toContain('more details')
  })

  it('detects private chat', () => {
    const result = lineParser.parse(SAMPLE_WESTERN)
    expect(result.type).toBe('private')
  })
})

describe('LINE Parser — Japanese era format (real export)', () => {
  it('detects LINE format', () => {
    expect(lineParser.canParse(SAMPLE_ERA)).toBe(true)
  })

  it('parses chat name', () => {
    const result = lineParser.parse(SAMPLE_ERA)
    expect(result.name).toBe('台日諮商室のトーク履歴')
  })

  it('converts era year to western year', () => {
    const result = lineParser.parse(SAMPLE_ERA)
    const first = result.messages[0]
    // R7 = Reiwa 7 = 2025
    expect(first.timestamp.getFullYear()).toBe(2025)
    expect(first.timestamp.getMonth()).toBe(1) // February
    expect(first.timestamp.getDate()).toBe(9)
  })

  it('parses messages with space separators', () => {
    const result = lineParser.parse(SAMPLE_ERA)
    expect(result.messages.length).toBe(10)
  })

  it('identifies all members', () => {
    const result = lineParser.parse(SAMPLE_ERA)
    expect(result.members.size).toBe(4)
    expect(result.members.has('ケン')).toBe(true)
    expect(result.members.has('梁毓麟yulin')).toBe(true)
  })

  it('detects group chat', () => {
    const result = lineParser.parse(SAMPLE_ERA)
    expect(result.type).toBe('group')
  })

  it('parses across multiple dates', () => {
    const result = lineParser.parse(SAMPLE_ERA)
    const dates = new Set(result.messages.map((m) => m.timestamp.toISOString().slice(0, 10)))
    expect(dates.size).toBe(2) // Feb 9 and Feb 11
  })
})

describe('LINE Parser — Chinese AM/PM format', () => {
  it('detects LINE format', () => {
    expect(lineParser.canParse(SAMPLE_CHINESE)).toBe(true)
  })

  it('handles full-width parentheses', () => {
    const result = lineParser.parse(SAMPLE_CHINESE)
    expect(result.messages.length).toBe(3)
  })

  it('adjusts PM hours', () => {
    const result = lineParser.parse(SAMPLE_CHINESE)
    const first = result.messages[0]
    expect(first.timestamp.getHours()).toBe(15) // 下午3:18 = 15:18
  })

  it('adjusts AM hours', () => {
    const result = lineParser.parse(SAMPLE_CHINESE)
    const morning = result.messages[2]
    expect(morning.timestamp.getHours()).toBe(10) // 上午10:30 = 10:30
  })
})
