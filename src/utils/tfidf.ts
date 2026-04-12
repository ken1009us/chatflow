/**
 * Lightweight TF-IDF implementation for per-member word scoring.
 *
 * Each member's messages form one "document". Words that appear across
 * all members get a low IDF (penalised), while words distinctive to a
 * single member receive a high score.
 */

export interface TfIdfResult {
  /** Per-document (member) TF-IDF scores: memberId → word → score */
  scores: Map<string, Map<string, number>>
  /** IDF value for each word across the corpus */
  idf: Map<string, number>
}

/**
 * Compute TF-IDF scores from per-document word counts.
 *
 * @param docs  memberId → (word → raw count)
 * @returns     TF-IDF scores per member and global IDF values
 */
export function computeTfIdf(
  docs: Map<string, Map<string, number>>,
): TfIdfResult {
  const totalDocs = docs.size
  if (totalDocs === 0) {
    return { scores: new Map(), idf: new Map() }
  }

  // Count how many documents contain each word
  const docFreq = new Map<string, number>()
  for (const wordCounts of docs.values()) {
    for (const word of wordCounts.keys()) {
      docFreq.set(word, (docFreq.get(word) ?? 0) + 1)
    }
  }

  // IDF = log(totalDocs / docsContainingWord)
  const idf = new Map<string, number>()
  for (const [word, df] of docFreq) {
    idf.set(word, df > 0 ? Math.log(totalDocs / df) : 0)
  }

  // TF-IDF per document
  const scores = new Map<string, Map<string, number>>()
  for (const [memberId, wordCounts] of docs) {
    let totalWords = 0
    for (const count of wordCounts.values()) {
      totalWords += count
    }
    if (totalWords === 0) continue

    const memberScores = new Map<string, number>()
    for (const [word, count] of wordCounts) {
      const tf = count / totalWords
      const wordIdf = idf.get(word) ?? 0
      memberScores.set(word, tf * wordIdf)
    }
    scores.set(memberId, memberScores)
  }

  return { scores, idf }
}
