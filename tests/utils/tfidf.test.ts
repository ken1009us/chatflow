import { describe, it, expect } from 'vitest'
import { computeTfIdf } from '@/utils/tfidf'

describe('computeTfIdf', () => {
  it('returns empty results for empty input', () => {
    const result = computeTfIdf(new Map())
    expect(result.scores.size).toBe(0)
    expect(result.idf.size).toBe(0)
  })

  it('gives IDF=0 for words appearing in all documents', () => {
    const docs = new Map<string, Map<string, number>>([
      ['alice', new Map([['hello', 5], ['cats', 3]])],
      ['bob', new Map([['hello', 2], ['dogs', 4]])],
    ])
    const { idf } = computeTfIdf(docs)

    // "hello" appears in both docs → IDF = log(2/2) = 0
    expect(idf.get('hello')).toBe(0)
    // "cats" appears in 1 doc → IDF = log(2/1) = ln(2) ≈ 0.693
    expect(idf.get('cats')).toBeCloseTo(Math.log(2), 5)
    expect(idf.get('dogs')).toBeCloseTo(Math.log(2), 5)
  })

  it('gives higher TF-IDF to distinctive words', () => {
    const docs = new Map<string, Map<string, number>>([
      ['alice', new Map([['common', 10], ['unique_a', 5]])],
      ['bob', new Map([['common', 10], ['unique_b', 5]])],
    ])
    const { scores } = computeTfIdf(docs)

    const aliceScores = scores.get('alice')!
    // "common" has IDF=0 → TF-IDF=0
    expect(aliceScores.get('common')).toBe(0)
    // "unique_a" has IDF>0 → TF-IDF>0
    expect(aliceScores.get('unique_a')!).toBeGreaterThan(0)
  })

  it('computes correct TF-IDF values', () => {
    // Single doc with two words: "foo" x3, "bar" x1 → total=4
    const docs = new Map<string, Map<string, number>>([
      ['alice', new Map([['foo', 3], ['bar', 1]])],
    ])
    const { scores, idf } = computeTfIdf(docs)

    // Both words appear in 1/1 docs → IDF = log(1/1) = 0
    expect(idf.get('foo')).toBe(0)
    expect(idf.get('bar')).toBe(0)

    // Single doc: all IDF=0 so all TF-IDF=0
    expect(scores.get('alice')!.get('foo')).toBe(0)
    expect(scores.get('alice')!.get('bar')).toBe(0)
  })

  it('handles three documents correctly', () => {
    const docs = new Map<string, Map<string, number>>([
      ['a', new Map([['shared', 2], ['only_a', 3]])],
      ['b', new Map([['shared', 1], ['only_b', 4]])],
      ['c', new Map([['shared', 5], ['only_c', 1]])],
    ])
    const { idf, scores } = computeTfIdf(docs)

    // "shared" in all 3 → IDF = log(3/3) = 0
    expect(idf.get('shared')).toBe(0)
    // "only_a" in 1 of 3 → IDF = log(3/1) = log(3)
    expect(idf.get('only_a')).toBeCloseTo(Math.log(3), 5)

    // Member a: total words = 2+3=5, TF(only_a) = 3/5, TF-IDF = (3/5)*log(3)
    const expected = (3 / 5) * Math.log(3)
    expect(scores.get('a')!.get('only_a')).toBeCloseTo(expected, 5)

    // Member a: TF-IDF(shared) = 0 (IDF=0)
    expect(scores.get('a')!.get('shared')).toBe(0)
  })

  it('skips documents with zero total words', () => {
    const docs = new Map<string, Map<string, number>>([
      ['empty', new Map()],
      ['has_words', new Map([['hello', 1]])],
    ])
    const { scores } = computeTfIdf(docs)
    expect(scores.has('empty')).toBe(false)
    expect(scores.has('has_words')).toBe(true)
  })
})
