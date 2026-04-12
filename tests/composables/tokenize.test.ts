import { describe, it, expect } from 'vitest'
import { tokenize } from '@/composables/useAnalysis'

describe('tokenize', () => {
  it('returns empty array for empty input', () => {
    expect(tokenize('')).toEqual([])
    expect(tokenize(undefined as unknown as string)).toEqual([])
  })

  it('extracts Latin words with 3+ chars', () => {
    const tokens = tokenize('Hello world hi no')
    expect(tokens).toContain('hello')
    expect(tokens).toContain('world')
    // "hi" and "no" are < 3 chars, should be excluded
    expect(tokens).not.toContain('hi')
    expect(tokens).not.toContain('no')
  })

  it('filters English stopwords', () => {
    const tokens = tokenize('the quick brown fox and the lazy dog')
    expect(tokens).not.toContain('the')
    expect(tokens).not.toContain('and')
    expect(tokens).toContain('quick')
    expect(tokens).toContain('brown')
    expect(tokens).toContain('lazy')
  })

  it('strips URLs from text', () => {
    const tokens = tokenize('Check https://example.com/foo and hello world')
    expect(tokens).not.toContain('https')
    expect(tokens).not.toContain('example')
    expect(tokens).toContain('check')
    expect(tokens).toContain('hello')
    expect(tokens).toContain('world')
  })

  it('filters member names (Latin)', () => {
    const tokens = tokenize('Alice loves pizza and Bob loves tacos', ['Alice', 'Bob'])
    expect(tokens).not.toContain('alice')
    expect(tokens).not.toContain('bob')
    expect(tokens).toContain('loves')
    expect(tokens).toContain('pizza')
    expect(tokens).toContain('tacos')
  })

  it('filters CJK member names from text', () => {
    const tokens = tokenize('今日は太郎と花子が遊んだ', ['太郎', '花子'])
    const allText = tokens.join('')
    expect(allText).not.toContain('太郎')
    expect(allText).not.toContain('花子')
  })

  it('handles Japanese text with Intl.Segmenter', () => {
    // Segmenter should extract meaningful words
    const tokens = tokenize('東京タワーはとても美しい')
    // Should contain meaningful segments, not single hiragana particles
    expect(tokens).not.toContain('は')
    // Should have multi-char segments
    for (const t of tokens) {
      expect(t.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('skips pure numbers', () => {
    const tokens = tokenize('test 12345 hello 42')
    expect(tokens).not.toContain('12345')
    expect(tokens).not.toContain('42')
    expect(tokens).toContain('test')
    expect(tokens).toContain('hello')
  })

  it('handles mixed Latin and CJK text', () => {
    const tokens = tokenize('Hello 東京 world')
    expect(tokens).toContain('hello')
    expect(tokens).toContain('world')
    // CJK part should produce some tokens (depends on Segmenter)
    expect(tokens.length).toBeGreaterThanOrEqual(2)
  })
})
