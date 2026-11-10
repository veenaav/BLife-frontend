import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { UserProfile, ProfileUpdateInput } from '@/lib/profileTypes'
import {
  getLocalProfile,
  apiUpdateProfile,
  resetLocalProfile,
  clearDemoSession,
  getIsGuestUser,
  setIsGuestUser,
  getAuthToken,
  removeAuthToken,
} from '@/lib/profileService'

interface ProfileContextValue {
  profile: UserProfile
  isLoading: boolean
  isGuest: boolean
  isLoggedIn: boolean
  setGuestSession: (isGuest: boolean) => void
  updateProfile: (input: ProfileUpdateInput) => Promise<UserProfile>
  resetProfile: () => void
  signOut: () => void
  refreshProfile: () => void
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => getLocalProfile())
  const [isGuest, setIsGuest] = useState<boolean>(() => getIsGuestUser())
  const [authToken, setAuthTokenState] = useState<string | null>(() => getAuthToken())
  const [isLoading, setIsLoading] = useState(false)

  const isLoggedIn = !isGuest && Boolean(authToken)

  const refreshProfile = useCallback(() => {
    setProfile(getLocalProfile())
    setIsGuest(getIsGuestUser())
    setAuthTokenState(getAuthToken())
  }, [])

  const setGuestSession = useCallback((guest: boolean) => {
    setIsGuestUser(guest)
    setIsGuest(guest)
    if (guest) {
      removeAuthToken()
      setAuthTokenState(null)
    }
  }, [])

  // Sync state if localStorage changes in another tab or in current tab via custom event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'bliffe_demo_profile' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          setProfile(parsed)
        } catch {
          // ignore parse errors
        }
      }
      if (e.key === 'bliffe_is_guest') {
        setIsGuest(e.newValue === 'true')
      }
      if (e.key === 'bliffe_auth_token') {
        setAuthTokenState(e.newValue)
      }
    }

    const handleCustomChange = (e: Event) => {
      const custom = e as CustomEvent<UserProfile>
      setAuthTokenState(getAuthToken())
      if (custom.detail) {
        setProfile(custom.detail)
      } else {
        refreshProfile()
      }
    }

    const handleGuestModeChange = (e: Event) => {
      const custom = e as CustomEvent<{ isGuest: boolean }>
      setAuthTokenState(getAuthToken())
      if (custom.detail && typeof custom.detail.isGuest === 'boolean') {
        setIsGuest(custom.detail.isGuest)
      } else {
        setIsGuest(getIsGuestUser())
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('bliffe:profile-changed', handleCustomChange)
    window.addEventListener('bliffe:guest-mode-changed', handleGuestModeChange)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('bliffe:profile-changed', handleCustomChange)
      window.removeEventListener('bliffe:guest-mode-changed', handleGuestModeChange)
    }
  }, [refreshProfile])

  const updateProfile = useCallback(async (input: ProfileUpdateInput): Promise<UserProfile> => {
    setIsLoading(true)
    try {
      const updated = await apiUpdateProfile(input)
      setProfile(updated)
      return updated
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetProfile = useCallback(() => {
    const reset = resetLocalProfile()
    setProfile(reset)
  }, [])

  const signOut = useCallback(() => {
    clearDemoSession()
    setAuthTokenState(null)
    setIsGuest(true)
    // Re-initialize clean state
    setProfile(resetLocalProfile())
  }, [])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        isGuest,
        isLoggedIn,
        setGuestSession,
        updateProfile,
        resetProfile,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
