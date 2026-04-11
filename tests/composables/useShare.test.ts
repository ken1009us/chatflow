import { describe, it, expect } from 'vitest'
import { useShare } from '@/composables/useShare'
import type { AnalysisResult } from '@/types'

describe('useShare', () => {
  const { encodeShareData, decodeShareData } = useShare()

  const mockResult: AnalysisResult = {
    totalMessages: 1000,
    memberCount: 3,
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-06-01'),
    },
    dailyAverage: 6.5,
    activityByDate: [
      { date: '2024-01-01', count: 10 },
      { date: '2024-01-02', count: 15 },
    ],
    activityByHourDay: Array.from({ length: 7 }, () => Array(24).fill(0)),
    memberRanking: [
      { name: 'Alice', count: 500 },
      { name: 'Bob', count: 300 },
      { name: 'Charlie', count: 200 },
    ],
    messageTypes: [
      { type: 'text', count: 800 },
      { type: 'image', count: 150 },
      { type: 'sticker', count: 50 },
    ],
    wordFrequency: [
      { word: 'hello', count: 50 },
      { word: 'thanks', count: 30 },
    ],
  }

  it('encodes and decodes share data correctly', () => {
    const encoded = encodeShareData('Test Chat', 'line', mockResult)
    expect(typeof encoded).toBe('string')
    expect(encoded.length).toBeGreaterThan(0)

    const decoded = decodeShareData(encoded)
    expect(decoded.name).toBe('Test Chat')
    expect(decoded.platform).toBe('line')
    expect(decoded.totalMessages).toBe(1000)
    expect(decoded.memberCount).toBe(3)
    expect(decoded.dailyAverage).toBe(6.5)
    expect(decoded.memberRanking.length).toBe(3)
  })

  it('preserves date range', () => {
    const encoded = encodeShareData('Test', 'line', mockResult)
    const decoded = decodeShareData(encoded)
    expect(new Date(decoded.dateRange.start).getFullYear()).toBe(2024)
  })

  it('limits data size', () => {
    const largeResult = {
      ...mockResult,
      activityByDate: Array.from({ length: 365 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        count: Math.floor(Math.random() * 100),
      })),
      wordFrequency: Array.from({ length: 200 }, (_, i) => ({
        word: `word${i}`,
        count: 200 - i,
      })),
    }
    const encoded = encodeShareData('Test', 'line', largeResult)
    const decoded = decodeShareData(encoded)
    // Should be truncated
    expect(decoded.activityByDate.length).toBeLessThanOrEqual(90)
    expect(decoded.wordFrequency.length).toBeLessThanOrEqual(100)
  })

  it('throws on invalid data', () => {
    expect(() => decodeShareData('invalid-base64-data!!!')).toThrow()
  })
})
