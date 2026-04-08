import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { schema } from './schema'

config()

type ContextLike = {
  env?: { [key: string]: string | undefined }
  context?: ContextLike
  event?: ContextLike
  h3Event?: ContextLike
  runtime?: ContextLike
  server?: ContextLike
}

function getEnvValue(context: unknown, key: string): string | null {
  const queue: unknown[] = [context]
  const seen = new Set<unknown>()

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || typeof current !== 'object' || seen.has(current)) {
      continue
    }

    seen.add(current)

    const record = current as ContextLike & Record<string, unknown>
    const fromEnv = record.env?.[key]
    if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
      return fromEnv
    }

    for (const value of Object.values(record)) {
      if (value && typeof value === 'object' && !seen.has(value)) {
        queue.push(value)
      }
    }
  }

  const fromProcess = process.env[key]
  if (typeof fromProcess === 'string' && fromProcess.trim().length > 0) {
    return fromProcess
  }

  return null
}

function getDatabaseUrl(context: unknown): string | null {
  const buildTimeDatabaseUrl =
    (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
      .env?.DATABASE_URL ?? null

  return getEnvValue(context, 'DATABASE_URL') ?? buildTimeDatabaseUrl
}

export function getDatabase(context: unknown) {
  const databaseUrl = getDatabaseUrl(context)
  if (!databaseUrl) {
    return null
  }

  const sql = neon(databaseUrl)

  return drizzle(sql, { schema })
}
