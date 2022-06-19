import { Prisma } from '@prisma/client'

export function jsonToArray(json: Prisma.JsonValue) {
  if (!json) return []
  if (typeof json !== 'object') return []
  if (!Array.isArray(json)) return Object.values(json)
  return json as string[]
}