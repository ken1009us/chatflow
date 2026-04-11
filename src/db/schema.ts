import Dexie, { type EntityTable } from 'dexie'
import type { Session, Member, Message } from '@/types'

const db = new Dexie('chatflow') as Dexie & {
  sessions: EntityTable<Session, 'id'>
  members: EntityTable<Member, 'id'>
  messages: EntityTable<Message, 'id'>
}

db.version(1).stores({
  sessions: '++id, platform, name, importedAt',
  members: '++id, sessionId, name',
  messages: '++id, sessionId, senderId, timestamp, type',
})

export { db }
