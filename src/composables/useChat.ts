import { ref } from 'vue'
import { db } from '@/db/schema'
import { detectParser } from '@/parsers/detector'
import type { ParsedChat } from '@/types'

export function useChat() {
  const parsing = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  async function importFile(file: File): Promise<number | null> {
    parsing.value = true
    progress.value = 0
    error.value = null

    try {
      progress.value = 10
      const content = await file.text()

      progress.value = 20
      const parser = detectParser(content)
      if (!parser) {
        error.value = 'Unsupported file format'
        return null
      }

      progress.value = 30
      const parsed: ParsedChat = parser.parse(content)

      progress.value = 60
      return await saveParsedChat(parsed)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      return null
    } finally {
      parsing.value = false
    }
  }

  async function saveParsedChat(parsed: ParsedChat): Promise<number> {
    const sessionId = await db.sessions.add({
      platform: parsed.platform,
      name: parsed.name,
      type: parsed.type,
      memberCount: parsed.members.size,
      messageCount: parsed.messages.length,
      importedAt: new Date(),
    })

    progress.value = 70

    const memberIdMap = new Map<string, number>()
    for (const [name, displayName] of parsed.members) {
      const memberId = await db.members.add({
        sessionId: sessionId as number,
        name,
        displayName,
      })
      memberIdMap.set(name, memberId as number)
    }

    progress.value = 80

    const batchSize = 1000
    const messages = parsed.messages
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize).map((m) => ({
        sessionId: sessionId as number,
        senderId: memberIdMap.get(m.sender) ?? 0,
        content: m.content,
        timestamp: m.timestamp,
        type: m.type,
      }))
      await db.messages.bulkAdd(batch)
      progress.value = 80 + (i / messages.length) * 20
    }

    progress.value = 100
    return sessionId as number
  }

  return { parsing, progress, error, importFile }
}
