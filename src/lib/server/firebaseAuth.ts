import { config } from 'dotenv'
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

config()

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  ),
)

type ContextLike = {
  env?: { [key: string]: string | undefined }
  context?: ContextLike
  event?: ContextLike
  h3Event?: ContextLike
  runtime?: ContextLike
  server?: ContextLike
}

type FirebaseAuthResult =
  | { ok: true; payload: JWTPayload }
  | { ok: false; error: string; status: 401 | 500 }

function getEnvValue(context: unknown, key: string): string | null {
  const queue: unknown[] = [context]
  const seen = new Set<unknown>()

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || typeof current !== 'object' || seen.has(current)) {
      continue
    }

    seen.add(current)
    const record = current as ContextLike

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

export async function verifyFirebaseTokenFromRequest(
  request: Request,
  context: unknown,
): Promise<FirebaseAuthResult> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, error: 'Missing bearer token.', status: 401 }
  }

  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) {
    return { ok: false, error: 'Missing bearer token.', status: 401 }
  }

  const buildTimeProjectId =
    (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
      .env?.VITE_FIREBASE_PROJECT_ID ?? null

  const projectId =
    getEnvValue(context, 'FIREBASE_PROJECT_ID') ??
    getEnvValue(context, 'VITE_FIREBASE_PROJECT_ID') ??
    buildTimeProjectId

  if (!projectId) {
    return {
      ok: false,
      error: 'Server missing FIREBASE_PROJECT_ID environment variable.',
      status: 500,
    }
  }

  try {
    const verified = await jwtVerify(token, GOOGLE_JWKS, {
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    })

    return { ok: true, payload: verified.payload }
  } catch {
    return {
      ok: false,
      error: 'Invalid or expired Firebase ID token.',
      status: 401,
    }
  }
}

export function isAdminEmail(
  context: unknown,
  email: string | undefined,
): boolean {
  if (!email) {
    return false
  }

  const raw =
    getEnvValue(context, 'ADMIN_EMAILS') ??
    getEnvValue(context, 'VITE_ADMIN_EMAILS')

  if (!raw) {
    return false
  }

  const allowList = raw
    .split(/[\n,;]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)

  return allowList.includes(email.toLowerCase())
}

export function isVerifiedEmail(payload: JWTPayload): boolean {
  return payload.email_verified === true
}
