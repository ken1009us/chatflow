import { db } from './schema'
import type { Session, Member, Message } from '@/types'

export async function getAllSessions(): Promise<Session[]> {
  return db.sessions.orderBy('importedAt').reverse().toArray()
}

export async function getSession(id: number): Promise<Session | undefined> {
  return db.sessions.get(id)
}

export async function deleteSession(id: number): Promise<void> {
  await db.transaction('rw', db.sessions, db.members, db.messages, async () => {
    await db.messages.where('sessionId').equals(id).delete()
    await db.members.where('sessionId').equals(id).delete()
    await db.sessions.delete(id)
  })
}

export async function getMembers(sessionId: number): Promise<Member[]> {
  return db.members.where('sessionId').equals(sessionId).toArray()
}

export async function getMessages(
  sessionId: number,
  options?: { start?: Date; end?: Date; senderId?: number; limit?: number }
): Promise<Message[]> {
  let collection = db.messages.where('sessionId').equals(sessionId)

  let results = await collection.toArray()

  if (options?.start) {
    results = results.filter((m) => m.timestamp >= options.start!)
  }
  if (options?.end) {
    results = results.filter((m) => m.timestamp <= options.end!)
  }
  if (options?.senderId) {
    results = results.filter((m) => m.senderId === options.senderId)
  }

  results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  if (options?.limit) {
    results = results.slice(0, options.limit)
  }

  return results
}

export async function searchMessages(
  sessionId: number,
  keyword: string,
  limit = 50
): Promise<Array<Message & { senderName: string }>> {
  const members = await getMembers(sessionId)
  const memberMap = new Map(members.map((m) => [m.id!, m.displayName]))
  const lowerKeyword = keyword.toLowerCase()

  const messages = await db.messages
    .where('sessionId')
    .equals(sessionId)
    .toArray()

  return messages
    .filter((m) => m.content.toLowerCase().includes(lowerKeyword))
    .slice(0, limit)
    .map((m) => ({ ...m, senderName: memberMap.get(m.senderId) ?? 'Unknown' }))
}

export async function updateMember(id: number, updates: Partial<Member>): Promise<void> {
  await db.members.update(id, updates)
}

export async function getAllMessagesForAnalysis(sessionId: number): Promise<Message[]> {
  return db.messages
    .where('sessionId')
    .equals(sessionId)
    .toArray()
}
