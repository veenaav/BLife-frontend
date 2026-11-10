import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Edit3,
  Mail,
  User as UserIcon,
  Camera,
  Check,
  X,
  LogOut,
  AlertTriangle,
  Sparkles,
  Trash2,
  Upload,
  UserPlus,
  LogIn,
  Compass,
} from 'lucide-react'
import AvatarDisplay from '@/components/AvatarDisplay'
import { AVATAR_PRESETS, renderPresetIcon } from '@/lib/avatarPresets'
import type { AvatarPresetId } from '@/lib/profileTypes'
import { useProfileForm } from '@/features/profile'
import { useProfile } from '@/context/ProfileContext'

export default function ProfilePage() {
  const { isLoggedIn, updateProfile } = useProfile()
  const directAvatarInputRef = useRef<HTMLInputElement>(null)
  const [directPhotoSuccess, setDirectPhotoSuccess] = useState(false)

  const {
    profile,
    isEditing,
    saveSuccess,
    formData,
    setFormData,
    errors,
    showDiscardModal,
    setShowDiscardModal,
    showSignOutModal,
    setShowSignOutModal,
    isSubmitting,
    fileInputRef,
    handleStartEditing,
    handleCancel,
    confirmDiscard,
    handleFileChange,
    handleRemovePhoto,
    handleSave,
    handleConfirmSignOut,
  } = useProfileForm()

  const handleDirectAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be less than 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        try {
          await updateProfile({
            ...profile,
            avatarType: 'upload',
            avatarCustomUrl: dataUrl,
          })
          setDirectPhotoSuccess(true)
          setTimeout(() => setDirectPhotoSuccess(false), 3000)
        } catch (err) {
          console.error('Failed to update avatar photo:', err)
        }
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // =========================================================================
  // GUEST VIEW: Clean, focused screen with account creation & sign-in provisions
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Top Navigation Bar with Back Arrow & Title */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1C4D3C]/70">
          <Link
            to="/home"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1C4D3C] bg-[#0D2D22] text-[#B2C8BA] hover:bg-[#133D2F] hover:text-[#F0F5EF] transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A6F16A]"
            aria-label="Back to Home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Profile
          </h1>

          {/* Guest Mode Indicator Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/40 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Guest Mode</span>
          </div>
        </div>

        {/* Clean, Focused Guest Container */}
        <div className="relative overflow-hidden rounded-3xl border border-[#1C4D3C] bg-gradient-to-b from-[#0D2D22] via-[#0D2D22]/90 to-[#08221A] p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Subtle nature radial glow */}
          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-[#A6F16A]/10 blur-3xl" />

          {/* Icon and Title */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#20D6A0]/30 bg-[#133D2F]/80 text-[#A6F16A] shadow-lg shadow-[#061812]/50">
              <UserPlus className="h-8 w-8 text-[#A6F16A]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Create Your Profile
              </h2>
              <p className="text-xs sm:text-sm text-[#B2C8BA] max-w-sm mx-auto leading-relaxed">
                You are currently exploring as a guest. Create an account or sign in to customize your biodiversity profile, choose your avatar, and manage your field observations.
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="rounded-2xl border border-[#1C4D3C]/70 bg-[#08221A]/80 p-4 space-y-2.5 text-xs text-[#D1E2D7]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#20D6A0]/20 text-[#20D6A0]">
                <Check className="h-3 w-3" />
              </div>
              <span>Personalized biodiversity avatar and bio</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#20D6A0]/20 text-[#20D6A0]">
                <Check className="h-3 w-3" />
              </div>
              <span>Secure, local-first field observations storage</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#20D6A0]/20 text-[#20D6A0]">
                <Check className="h-3 w-3" />
              </div>
              <span>Contribute to India&apos;s biodiversity mapping</span>
            </div>
          </div>

          {/* Action Provisions */}
          <div className="space-y-3 pt-1">
            <Link
              to="/create-account"
              className="w-full flex h-11 sm:h-12 min-h-[44px] sm:min-h-[48px] items-center justify-center gap-2 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] font-extrabold text-sm sm:text-base shadow-lg shadow-[#20D6A0]/20 hover:shadow-xl hover:shadow-[#A6F16A]/30 active:scale-[0.98] transition-all"
            >
              <UserPlus className="w-4.5 h-4.5 text-[#061812]" />
              <span>Create Account</span>
            </Link>

            <Link
              to="/login"
              className="w-full flex h-11 sm:h-12 min-h-[44px] sm:min-h-[48px] items-center justify-center gap-2 px-6 rounded-xl sm:rounded-2xl border border-[#1C4D3C] bg-[#08221A] text-[#A6F16A] hover:bg-[#133D2F] hover:text-[#F0F5EF] font-bold text-sm sm:text-base shadow-md active:scale-[0.98] transition-all"
            >
              <LogIn className="w-4.5 h-4.5 text-[#A6F16A]" />
              <span>Sign In to Existing Account</span>
            </Link>
          </div>

          {/* Return link */}
          <div className="text-center pt-1">
            <Link
              to="/home"
              className="inline-flex items-center gap-1.5 text-xs text-[#7B9586] hover:text-[#B2C8BA] transition-colors"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Continue exploring as guest</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // REGISTERED USER VIEW: Full profile details, avatar, stats, editing & account actions
  // =========================================================================
  return (
    <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8 space-y-6">
      {/* Top Navigation Bar with Back Arrow & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/home"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1C4D3C] bg-[#0D2D22] text-[#B2C8BA] hover:bg-[#133D2F] hover:text-[#F0F5EF] transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A6F16A]"
          aria-label="Back to Home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          My Profile
        </h1>

        <div className="w-10" aria-hidden="true" />
      </div>

      {/* Success Banners */}
      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#20D6A0]/40 bg-[#0D2D22] p-4 text-[#F0F5EF] shadow-lg animate-in fade-in duration-300">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#20D6A0]/20 text-[#20D6A0]">
            <Check className="h-4.5 w-4.5" />
          </div>
          <div className="text-sm font-semibold text-white">
            Profile updated successfully!
          </div>
        </div>
      )}

      {directPhotoSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#20D6A0]/40 bg-[#0D2D22] p-4 text-[#F0F5EF] shadow-lg animate-in fade-in duration-300">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#20D6A0]/20 text-[#20D6A0]">
            <Check className="h-4.5 w-4.5" />
          </div>
          <div className="text-sm font-semibold text-white">
            Avatar photo updated successfully!
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE: PROFILE OVERVIEW
         ========================================================================= */}
      {!isEditing && (
        <div className="space-y-6">
          {/* Main Profile Card */}
          <div className="relative overflow-hidden rounded-3xl border border-[#1C4D3C] bg-gradient-to-b from-[#0D2D22] to-[#08221A] p-6 sm:p-8 shadow-xl">
            {/* Subtle nature radial glow in the background */}
            <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[#A6F16A]/10 blur-3xl" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Selected Avatar Container with Interactive Camera Trigger */}
              <div className="relative shrink-0">
                <input
                  ref={directAvatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleDirectAvatarUpload}
                  className="hidden"
                  id="direct-avatar-upload"
                />
                <button
                  type="button"
                  onClick={() => directAvatarInputRef.current?.click()}
                  className="relative block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer"
                  title="Click to upload a new avatar photo"
                  aria-label="Click to upload a new avatar photo"
                >
                  <AvatarDisplay
                    avatarType={profile.avatarType}
                    avatarPresetId={profile.avatarPresetId}
                    avatarCustomUrl={profile.avatarCustomUrl}
                    size="xl"
                    className="hover:border-emerald-300 transition-all duration-200"
                    alt={`${profile.fullName}'s profile avatar`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => directAvatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#0A261D] bg-[#133D2F] text-emerald-400 shadow-md hover:bg-[#1C4D3C] hover:text-emerald-300 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                  title="Upload image or take photo"
                  aria-label="Upload image or take photo"
                >
                  <Camera className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </button>
              </div>

              {/* User Overview Information */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {profile.fullName}
                    </h2>
                    {profile.displayName && (
                      <span className="inline-flex items-center self-center sm:self-auto rounded-full bg-[#133D2F] px-2.5 py-0.5 text-xs font-medium text-[#A6F16A] border border-[#1C4D3C]">
                        @{profile.displayName}
                      </span>
                    )}
                  </div>

                  {profile.email && (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm text-[#B2C8BA]">
                      <Mail className="h-4 w-4 text-[#7B9586]" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>

                {/* About Me / Role Tag Section */}
                <div className="pt-2 space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#133D2F]/70 border border-[#20D6A0]/30 px-2.5 py-0.5 text-xs font-medium text-[#A6F16A]">
                    <Sparkles className="h-3 w-3 text-[#20D6A0]" />
                    <span>About Me</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#D1E2D7] leading-relaxed pt-0.5 max-w-lg">
                    {profile.aboutMe || profile.bio || 'No tagline or about me added yet. Click "Edit Profile" to add one!'}
                  </p>
                </div>

                {/* Edit Profile Action Button */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] px-5 py-2.5 text-sm font-bold text-[#061812] shadow-md shadow-[#20D6A0]/15 hover:shadow-[#A6F16A]/25 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A6F16A] cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions Section */}
          <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22]/40 p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#B2C8BA]">
              Account Actions
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-sm font-medium text-white">Sign Out</p>
                <p className="text-xs text-[#7B9586]">
                  Sign out from your active BLife session.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSignOutModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-2.5 text-xs sm:text-sm font-semibold text-red-300 hover:bg-red-900/30 hover:border-red-500/60 transition-all active:scale-95 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT MODE: PERSONAL INFORMATION FORM
         ========================================================================= */}
      {isEditing && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-7 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Edit Personal Information</h2>
                <p className="text-xs text-[#B2C8BA]">
                  Update your name, greeting handle, bio, and biodiversity avatar.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1C4D3C] bg-[#08221A] text-[#B2C8BA] hover:text-white cursor-pointer"
                aria-label="Close edit mode"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 1. Avatar Selection Section */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white">
                Profile Avatar
              </label>
              <p className="text-xs text-[#B2C8BA]">
                Choose a biodiversity-themed avatar or upload your own photo.
              </p>

              {/* Current Preview with Overlaid Edit/Camera Button */}
              <div className="flex items-center gap-4 rounded-2xl border border-[#1C4D3C] bg-[#08221A] p-3.5">
                <div
                  className="relative shrink-0 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to upload custom photo"
                >
                  <AvatarDisplay
                    avatarType={formData.avatarType}
                    avatarPresetId={formData.avatarPresetId}
                    avatarCustomUrl={formData.avatarCustomUrl}
                    size="lg"
                    className="hover:border-emerald-300 transition-all duration-200"
                  />
                  {/* Overlaid Camera Button on Avatar Frame */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#0A261D] bg-[#133D2F] text-emerald-400 shadow-sm hover:bg-[#1C4D3C] hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                    title="Upload custom photo"
                    aria-label="Upload photo"
                  >
                    <Camera className="h-3 w-3" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-xs text-[#7B9586] block">Active Avatar</span>
                  <span className="text-sm font-semibold text-white truncate block">
                    {formData.avatarType === 'upload'
                      ? 'Custom Photo'
                      : AVATAR_PRESETS[formData.avatarPresetId]?.name || 'Default Person'}
                  </span>
                  <span className="text-[11px] text-[#A6F16A] block">
                    {formData.avatarType === 'upload'
                      ? 'Custom uploaded image'
                      : AVATAR_PRESETS[formData.avatarPresetId]?.subtitle}
                  </span>
                </div>

                {/* Photo Upload & Remove Buttons */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profile-photo-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#1C4D3C] bg-[#133D2F] px-3 py-2 text-xs font-semibold text-[#A6F16A] hover:bg-[#1C4D3C] transition-all cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Photo</span>
                  </button>

                  {formData.avatarType === 'upload' && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-950/20 p-2 text-xs font-semibold text-red-300 hover:bg-red-900/30 cursor-pointer"
                      title="Remove custom photo and use preset"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Preset Avatar Grid */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-medium text-[#7B9586] uppercase tracking-wider">
                  Biodiversity Themes
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(AVATAR_PRESETS) as AvatarPresetId[]).map((presetId) => {
                    const preset = AVATAR_PRESETS[presetId]
                    const isSelected =
                      formData.avatarType === 'preset' && formData.avatarPresetId === presetId

                    return (
                      <button
                        key={presetId}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            avatarType: 'preset',
                            avatarPresetId: presetId,
                          }))
                        }
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#A6F16A] bg-[#133D2F] shadow-sm shadow-[#A6F16A]/20'
                            : 'border-[#1C4D3C] bg-[#08221A] hover:border-[#20D6A0]/50 hover:bg-[#0D2D22]'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border overflow-hidden ${preset.borderColor} ${preset.bgColor} ${preset.textColor}`}
                        >
                          {preset.imageUrl ? (
                            <img
                              src={preset.imageUrl}
                              alt={preset.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            renderPresetIcon(presetId, 'h-4 w-4')
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`block text-xs font-semibold truncate ${
                              isSelected ? 'text-[#A6F16A]' : 'text-white'
                            }`}
                          >
                            {preset.name}
                          </span>
                          <span className="block text-[10px] text-[#7B9586] truncate">
                            {preset.subtitle}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 2. Full Name Input (Required) */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-sm font-semibold text-white">
                Full Name <span className="text-[#A6F16A]">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#7B9586]">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value })
                    if (errors.fullName) {
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  }}
                  placeholder="e.g. Veena V"
                  className={`w-full rounded-xl border bg-[#08221A] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#526D5F] focus:outline-none focus:ring-2 ${
                    errors.fullName
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-[#1C4D3C] focus:border-[#A6F16A] focus:ring-[#A6F16A]/30'
                  }`}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
              </div>
              {errors.fullName && (
                <p id="fullName-error" className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* 3. Display Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="displayName" className="block text-sm font-semibold text-white">
                Display Name (Greeting)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#7B9586]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. Veena"
                  className="w-full rounded-xl border border-[#1C4D3C] bg-[#08221A] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#526D5F] focus:border-[#A6F16A] focus:outline-none focus:ring-2 focus:ring-[#A6F16A]/30"
                />
              </div>
              <p className="text-[11px] text-[#7B9586]">
                Used for the personalised greeting on the Home screen (e.g. &quot;Hi,{' '}
                {formData.displayName || formData.fullName.split(' ')[0] || 'Naturalist'}!&quot;).
              </p>
            </div>

            {/* 4. Email (Informational / Read-Only in Demo) */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-white">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#7B9586]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full rounded-xl border border-[#1C4D3C]/50 bg-[#061812] py-2.5 pl-10 pr-4 text-sm text-[#7B9586] cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-[#7B9586]">
                Email changes will be linked through your organization or identity provider when
                the backend authentication is active.
              </p>
            </div>

            {/* 4. About Me / Role Tag Input (Restricted to ~2 sentences / 140 chars) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="aboutMe" className="block text-sm font-semibold text-white">
                  About Me / Role Tag
                </label>
                <span className="text-[10px] text-[#7B9586]">
                  {formData.aboutMe.length}/140 characters • ~2 sentences max
                </span>
              </div>
              <div className="relative">
                <textarea
                  id="aboutMe"
                  rows={2}
                  maxLength={140}
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  placeholder="e.g. GIS enthusiast, student, nature lover documenting local flora & fauna..."
                  className="w-full rounded-xl border border-[#1C4D3C] bg-[#08221A] p-3 text-sm text-white placeholder-[#526D5F] focus:border-[#A6F16A] focus:outline-none focus:ring-2 focus:ring-[#A6F16A]/30 resize-none leading-relaxed"
                />
              </div>
              <p className="text-[11px] text-[#7B9586]">
                A concise tagline or approximately 2-sentence description of your field role or interests.
              </p>
            </div>

            {/* Action Buttons: Save & Cancel */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-3 border-t border-[#1C4D3C]">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto rounded-xl border border-[#1C4D3C] bg-[#08221A] px-5 py-2.5 text-sm font-semibold text-[#B2C8BA] hover:bg-[#133D2F] hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] px-6 py-2.5 text-sm font-bold text-[#061812] shadow-md shadow-[#20D6A0]/20 hover:shadow-[#A6F16A]/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* =========================================================================
          CONFIRMATION DIALOG: DISCARD UNSAVED CHANGES
         ========================================================================= */}
      {showDiscardModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-title"
        >
          <div className="w-full max-w-sm rounded-3xl border border-[#1C4D3C] bg-[#08221A] p-6 text-center space-y-4 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h3 id="discard-title" className="text-lg font-bold text-white">
                Discard unsaved changes?
              </h3>
              <p className="text-xs text-[#B2C8BA] leading-relaxed">
                You have modified your profile information. Exiting now will lose any unsaved edits.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="flex-1 rounded-xl border border-[#1C4D3C] bg-[#0D2D22] py-2.5 text-xs font-semibold text-white hover:bg-[#133D2F] cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={confirmDiscard}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 active:scale-95 shadow-md cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRMATION DIALOG: SIGN OUT
         ========================================================================= */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signout-title"
        >
          <div className="w-full max-w-sm rounded-3xl border border-[#1C4D3C] bg-[#08221A] p-6 text-center space-y-4 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-300">
              <LogOut className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h3 id="signout-title" className="text-lg font-bold text-white">
                Sign Out?
              </h3>
              <p className="text-xs text-[#B2C8BA] leading-relaxed">
                Are you sure you want to sign out from your active BLife session? You can sign back in anytime with your credentials.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 rounded-xl border border-[#1C4D3C] bg-[#0D2D22] py-2.5 text-xs font-semibold text-white hover:bg-[#133D2F] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSignOut}
                className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-2.5 text-xs font-bold text-white hover:from-red-700 hover:to-rose-700 active:scale-95 shadow-md cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
