import type { ParsedChat } from '@/types'

export interface ChatParser {
  readonly platform: string
  canParse(content: string): boolean
  parse(content: string): ParsedChat
}
