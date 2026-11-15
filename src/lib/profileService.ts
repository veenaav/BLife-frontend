import type { UserProfile, ProfileUpdateInput } from './profileTypes'

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const PROFILE_STORAGE_KEY = 'bliffe_demo_profile'
const AUTH_TOKEN_KEY = 'bliffe_auth_token'
const GUEST_STORAGE_KEY = 'bliffe_is_guest'
const GUEST_ID_KEY = 'bliffe_guest_user_id'
const USERS_STORAGE_KEY = 'blife_registered_users'

interface StoredUserRecord {
  profile: UserProfile
  password: string
  token: string
}

function getStoredUsers(): Record<string, StoredUserRecord> {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) || {}
  } catch {
    return {}
  }
}

function saveRegisteredUser(email: string, record: StoredUserRecord): void {
  try {
    const users = getStoredUsers()
    users[email.toLowerCase()] = record
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (err) {
    console.warn('[profileService] Failed to persist user credentials locally:', err)
  }
}

interface AuthResponsePayload {
  user?: Partial<UserProfile> & { name?: string; profile?: Partial<UserProfile> }
  token?: string
  error?: string
  message?: string
}

async function safeParseJson<T = AuthResponsePayload>(res: Response): Promise<T | null> {
  try {
    const text = await res.text()
    if (!text || !text.trim()) {
      return null
    }
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export function getCurrentUserId(): string {
  try {
    if (getIsGuestUser()) {
      let guestId = localStorage.getItem(GUEST_ID_KEY)
      if (!guestId) {
        guestId = `guest_${Math.random().toString(36).substring(2, 9)}`
        localStorage.setItem(GUEST_ID_KEY, guestId)
      }
      return guestId
    }
    const profile = getLocalProfile()
    return profile?.id || 'bliffe-demo-user'
  } catch {
    return 'bliffe-demo-user'
  }
}

export function getIsGuestUser(): boolean {
  try {
    return localStorage.getItem(GUEST_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setIsGuestUser(isGuest: boolean): void {
  try {
    if (isGuest) {
      localStorage.setItem(GUEST_STORAGE_KEY, 'true')
    } else {
      localStorage.removeItem(GUEST_STORAGE_KEY)
    }
    window.dispatchEvent(new CustomEvent('bliffe:guest-mode-changed', { detail: { isGuest } }))
  } catch (err) {
    console.error('[profileService] Failed to set guest mode in localStorage:', err)
  }
}

export const DEFAULT_MOCK_PROFILE: UserProfile = {
  id: 'bliffe-demo-user',
  fullName: 'Veena V',
  displayName: 'Veena',
  email: 'veena@field.blife.org',
  bio: 'Biodiversity enthusiast & field observer documenting flora, fauna, and local ecosystems.',
  aboutMe: 'GIS enthusiast & nature lover documenting local ecosystems and flora.',
  roleTag: 'GIS enthusiast • Nature lover',
  avatarType: 'preset',
  avatarPresetId: 'user',
  avatarCustomUrl: null,
  updatedAt: new Date().toISOString(),
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function removeAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getLocalProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) {
      return DEFAULT_MOCK_PROFILE
    }
    const parsed = JSON.parse(raw) as UserProfile
    if (!parsed || !parsed.fullName) {
      return DEFAULT_MOCK_PROFILE
    }
    return parsed
  } catch (err) {
    console.warn('[profileService] Failed to parse profile from localStorage:', err)
    return DEFAULT_MOCK_PROFILE
  }
}

export function setLocalProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } catch (err) {
    console.error('[profileService] Failed to save profile to localStorage:', err)
  }
}

export async function apiRegister(fullName: string, email: string, password: string): Promise<{ user: UserProfile; token: string }> {
  const normalizedEmail = email.trim().toLowerCase()
  const resolvedName = fullName.trim()
  const resolvedDisplayName = resolvedName.split(/\s+/)[0] || 'Researcher'

  let backendRes: Response | null = null
  let backendData: AuthResponsePayload | null = null

  try {
    backendRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: resolvedName, email: normalizedEmail, password }),
    })
    backendData = await safeParseJson(backendRes)
  } catch (err) {
    console.info('[profileService] Remote backend unreachable for registration, falling back to local account storage:', err)
  }

  // 1. Backend 2xx success
  if (backendRes && backendRes.ok && backendData) {
    const serverName = (backendData.user?.fullName || backendData.user?.name || resolvedName).trim()
    const serverDisplayName = backendData.user?.displayName || (serverName ? serverName.split(/\s+/)[0] : resolvedDisplayName)

    const profile: UserProfile = {
      id: backendData.user?.id || `user-${Date.now()}`,
      fullName: serverName,
      displayName: serverDisplayName,
      email: backendData.user?.email || normalizedEmail,
      bio: backendData.user?.bio || backendData.user?.profile?.bio || '',
      avatarType: backendData.user?.avatarType || backendData.user?.profile?.avatarType || 'preset',
      avatarPresetId: backendData.user?.avatarPresetId || backendData.user?.profile?.avatarPresetId || 'user',
      avatarCustomUrl: backendData.user?.avatarCustomUrl || backendData.user?.profile?.avatarCustomUrl || null,
      updatedAt: backendData.user?.updatedAt || new Date().toISOString(),
    }

    setLocalProfile(profile)
    setIsGuestUser(false)
    const activeToken = backendData.token || `token-${Date.now()}`
    setAuthToken(activeToken)
    saveRegisteredUser(normalizedEmail, {
      profile,
      password,
      token: activeToken,
    })
    window.dispatchEvent(new CustomEvent('bliffe:profile-changed', { detail: profile }))

    return { user: profile, token: activeToken }
  }

  // 2. Explicit 4xx client validation rejection from backend (e.g., email already registered)
  if (backendRes && backendRes.status >= 400 && backendRes.status < 500 && backendData?.error) {
    throw new Error(backendData.error || 'Failed to register account')
  }

  // 3. Backend is down (502, 504, 500 without JSON, connection refused, or fetch error).
  // Fall back to offline local account storage:
  const storedUsers = getStoredUsers()
  if (storedUsers[normalizedEmail]) {
    throw new Error('An account with this email already exists. Please log in instead.')
  }

  const localId = `user-${Date.now()}`
  const profile: UserProfile = {
    id: localId,
    fullName: resolvedName,
    displayName: resolvedDisplayName,
    email: normalizedEmail,
    bio: 'Biodiversity enthusiast & field observer documenting flora, fauna, and local ecosystems.',
    avatarType: 'preset',
    avatarPresetId: 'user',
    avatarCustomUrl: null,
    updatedAt: new Date().toISOString(),
  }

  const localToken = `local-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  saveRegisteredUser(normalizedEmail, {
    profile,
    password,
    token: localToken,
  })

  setLocalProfile(profile)
  setIsGuestUser(false)
  setAuthToken(localToken)
  window.dispatchEvent(new CustomEvent('bliffe:profile-changed', { detail: profile }))

  return { user: profile, token: localToken }
}

export async function apiLogin(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
  const normalizedEmail = email.trim().toLowerCase()

  let backendRes: Response | null = null
  let backendData: AuthResponsePayload | null = null

  try {
    backendRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password }),
    })
    backendData = await safeParseJson(backendRes)
  } catch (err) {
    console.info('[profileService] Remote backend unreachable for login, falling back to local accounts store:', err)
  }

  // 1. Backend 2xx success
  if (backendRes && backendRes.ok && backendData) {
    const resolvedName = (backendData.user?.fullName || backendData.user?.name || email.split('@')[0] || '').trim()
    const resolvedDisplayName = backendData.user?.displayName || (resolvedName ? resolvedName.split(/\s+/)[0] : 'Researcher')

    const profile: UserProfile = {
      id: backendData.user?.id || `user-${Date.now()}`,
      fullName: resolvedName,
      displayName: resolvedDisplayName,
      email: backendData.user?.email || normalizedEmail,
      bio: backendData.user?.bio || backendData.user?.profile?.bio || '',
      avatarType: backendData.user?.avatarType || backendData.user?.profile?.avatarType || 'preset',
      avatarPresetId: backendData.user?.avatarPresetId || backendData.user?.profile?.avatarPresetId || 'user',
      avatarCustomUrl: backendData.user?.avatarCustomUrl || backendData.user?.profile?.avatarCustomUrl || null,
      updatedAt: backendData.user?.updatedAt || new Date().toISOString(),
    }

    setLocalProfile(profile)
    setIsGuestUser(false)
    const activeToken = backendData.token || `token-${Date.now()}`
    setAuthToken(activeToken)
    saveRegisteredUser(normalizedEmail, {
      profile,
      password,
      token: activeToken,
    })
    window.dispatchEvent(new CustomEvent('bliffe:profile-changed', { detail: profile }))

    return { user: profile, token: activeToken }
  }

  // 2. Explicit 4xx rejection from server (e.g. 401 Unauthorized)
  if (backendRes && backendRes.status >= 400 && backendRes.status < 500 && backendData?.error) {
    // Check if user was registered locally offline
    const storedUsers = getStoredUsers()
    const localRecord = storedUsers[normalizedEmail]
    if (localRecord && localRecord.password === password) {
      setLocalProfile(localRecord.profile)
      setIsGuestUser(false)
      setAuthToken(localRecord.token)
      window.dispatchEvent(new CustomEvent('bliffe:profile-changed', { detail: localRecord.profile }))
      return { user: localRecord.profile, token: localRecord.token }
    }
    throw new Error(backendData.error || 'Invalid email or password')
  }

  // 3. Backend offline / 5xx / unreachable -> check local storage
  const storedUsers = getStoredUsers()
  const localRecord = storedUsers[normalizedEmail]

  if (localRecord) {
    if (localRecord.password !== password) {
      throw new Error('Invalid password. Please check your credentials.')
    }
    setLocalProfile(localRecord.profile)
    setIsGuestUser(false)
    setAuthToken(localRecord.token)
    window.dispatchEvent(new CustomEvent('bliffe:profile-changed', { detail: localRecord.profile }))
    return { user: localRecord.profile, token: localRecord.token }
  }

  // 4. Check if logging in as current local profile or default demo profile:
  const currentProfile = getLocalProfile()
  if (
    currentProfile &&
    (currentProfile.email.toLowerCase() === normalizedEmail ||
      DEFAULT_MOCK_PROFILE.email.toLowerCase() === normalizedEmail)
  ) {
    const localToken = `local-token-${Date.now()}`
    setAuthToken(localToken)
    setIsGuestUser(false)
    window.dispatchEvent(new CustomEvent('bliffe:profile-changed', { detail: currentProfile }))
    return { user: currentProfile, token: localToken }
  }

  throw new Error('No account found for this email. Please check your credentials or create an account.')
}

export async function apiUpdateProfile(input: ProfileUpdateInput): Promise<UserProfile> {
  const current = getLocalProfile()
  const token = getAuthToken()

  const resolvedAboutMe = (input.aboutMe !== undefined ? input.aboutMe : input.bio !== undefined ? input.bio : current.aboutMe || current.bio || '').trim()

  const updated: UserProfile = {
    ...current,
    fullName: input.fullName.trim(),
    displayName: input.displayName ? input.displayName.trim() : input.fullName.trim().split(/\s+/)[0],
    bio: resolvedAboutMe,
    aboutMe: resolvedAboutMe,
    roleTag: (input.roleTag || resolvedAboutMe).trim(),
    avatarType: input.avatarType,
    avatarPresetId: input.avatarPresetId,
    avatarCustomUrl: input.avatarType === 'upload' ? input.avatarCustomUrl : null,
    updatedAt: new Date().toISOString(),
  }

  try {
    if (token) {
      await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      })
    }
  } catch (err) {
    console.warn('[profileService] Backend sync failed, keeping local copy:', err)
  }

  setLocalProfile(updated)
  return updated
}

export function resetLocalProfile(): UserProfile {
  setLocalProfile(DEFAULT_MOCK_PROFILE)
  return DEFAULT_MOCK_PROFILE
}

export function clearDemoSession(): void {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    localStorage.removeItem(GUEST_ID_KEY)
    removeAuthToken()
    setIsGuestUser(false)
  } catch (err) {
    console.error('[profileService] Failed to clear session:', err)
  }
}
