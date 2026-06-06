// biome-ignore assist/source/organizeImports: <explanation>
import { getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'

const SESSION_COOKIE = 'session'
const SESSION_MAX_AGE = 60 * 60 * 24
const SECRET = 'dgi-vehicle-compliance-demo-secret-2025'

interface SessionUser {
  username: string
  name: string
  role: string
}

const DEFAULT_USER: SessionUser = {
  username: 'admin',
  name: 'Admin DGI',
  role: 'Inspecteur principal',
}
const DEFAULT_PASSWORD = 'admin123'

export const loginFn = createServerFn({ method: 'POST' }).handler(async ({ data }) => {
  const { createHmac } = await import('node:crypto')

  const { username, password } = data as unknown as { username: string; password: string }

  if (username !== DEFAULT_USER.username || password !== DEFAULT_PASSWORD) {
    return { success: false, error: 'Identifiants incorrects' }
  }

  const payload = { user: DEFAULT_USER, exp: Date.now() + SESSION_MAX_AGE * 1000 }
  const raw = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(raw).digest('base64url')
  const token = `${raw}.${sig}`

  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })

  return { success: true, user: DEFAULT_USER }
})

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  deleteCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  })

  return { success: true }
})

export const getSessionFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { createHmac, timingSafeEqual } = await import('node:crypto')

  const token = getCookie(SESSION_COOKIE)
  if (!token) return { user: null }

  const dot = token.lastIndexOf('.')
  if (dot === -1) return { user: null }

  const raw = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  const expected = createHmac('sha256', SECRET).update(raw).digest('base64url')
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)

  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return { user: null }
  }

  try {
    const payload = JSON.parse(Buffer.from(raw, 'base64url').toString())
    if (payload.exp && payload.exp > Date.now()) {
      return { user: payload.user as SessionUser }
    }
    return { user: null }
  } catch {
    return { user: null }
  }
})
