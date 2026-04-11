import type { ChatParser } from './base'
import { lineParser } from './line'

const parsers: ChatParser[] = [lineParser]

export function detectParser(content: string): ChatParser | null {
  for (const parser of parsers) {
    if (parser.canParse(content)) return parser
  }
  return null
}
