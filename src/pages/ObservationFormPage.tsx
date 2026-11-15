import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  ORGANISM_STATUSES,
  LOCATION_VISIBILITIES,
  MICRO_HABITATS,
  TRADITIONAL_KNOWLEDGE_SOURCES,
  type YesNo,
  type IdentificationStatus,
  type OrganismStatus,
  type BasisOfRecord,
  BASIS_OF_RECORD_OPTIONS,
} from '@/db/database'
import {
  ArrowLeft,
  MapPin,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  X,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Tag as TagIcon,
  FolderGit2,
  Search,
  Sparkles,
  Layers,
  FileText,
  Eye,
  BookOpen,
} from 'lucide-react'
import TagSelector from '@/components/TagSelector'
import { AppSelect, AppMultiSelect } from '@/components/ui/select'
import {
  SPECIES_GROUPS,
  HABITAT_TYPES,
  ECOLOGICAL_LIFE_STAGES,
  REPRODUCTIVE_ATTRIBUTES,
  SEX_OPTIONS,
  EVIDENCE_OF_PRESENCE,
  SEASONS,
  useObservationForm,
  PhotoTipsModal,
  LocationTipsModal,
  EcologyTipsModal,
  TraditionalKnowledgeTipsModal,
} from '@/features/observations'

export { SPECIES_GROUPS }

export default function ObservationFormPage() {
  const form = useObservationForm()
  const { geo } = form

  // Exclusive accordion behavior: only one section expanded at a time, all closed by default
  type SectionKey =
    | 'photo_location'
    | 'species'
    | 'ecology'
    | 'tk'
    | 'notes'
    | 'tags'
    | 'visibility'
    | 'projects'

  const [activeSection, setActiveSection] = useState<SectionKey | null>(null)
  const [showSpotInfo, setShowSpotInfo] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleOpenConfirm = () => {
    if (!form.speciesName.trim() && !form.isUnknown) {
      alert('Please enter a species name or mark Identification Status as "Unknown".')
      return
    }
    if (form.isUnknown && form.photos.length === 0) {
      alert('At least one photograph is required when species is marked as "Unknown".')
      return
    }
    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    const success = await form.handleSaveObservation()
    if (success) {
      setShowConfirmModal(false)
      setActiveSection(null)
      if (form.isEditMode) {
        form.navigate('/new-observation', { replace: true })
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const toggleSection = (section: SectionKey) => {
    setActiveSection((current) => (current === section ? null : section))
  }

  const openPhotoLocation = activeSection === 'photo_location'
  const openSpecies = activeSection === 'species'
  const openEcology = activeSection === 'ecology'
  const openTk = activeSection === 'tk'
  const openNotes = activeSection === 'notes'
  const openTags = activeSection === 'tags'
  const openVisibility = activeSection === 'visibility'
  const openProjects = activeSection === 'projects'

  if (form.isLoadingExisting) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-slate-500">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#165B33]" />
        <p className="mt-3 text-sm">Loading observation record...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6">
      {/* Header Context */}
      {form.surveyId ? (
        <div className="mb-6">
          <nav className="mb-2.5 flex items-center gap-1.5 text-xs tracking-wider uppercase text-[#7B9586]">
            <Link
              to={`/projects/${form.projectId}/wards/${form.wardId}/surveys`}
              className="inline-flex items-center gap-1 text-[#A6F16A] font-medium hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Field Visits</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#F0F5EF]">Log Observation</span>
          </nav>

          <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-4 sm:p-5 shadow-xl shadow-[#061812]/50 text-[#F0F5EF]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-3 py-0.5 text-xs font-semibold tracking-wider uppercase text-[#A6F16A]">
                Ward {form.activeWard?.wardNumber}
              </span>
              <span className="text-xs text-[#B2C8BA] font-medium">
                {form.activeSurvey?.leadObserver
                  ? `Lead: ${form.activeSurvey.leadObserver}`
                  : 'Survey Session'}
              </span>
            </div>
            <p className="mt-1.5 text-lg font-bold text-white tracking-tight">
              {form.activeWard?.wardName || 'Ward'}
              {form.activeProject?.name ? ` • ${form.activeProject.name}` : ''}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between border-b border-[#1C4D3C] pb-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white">
              {form.isEditMode ? 'Edit Observation' : 'New Observation'}
            </h1>
            {form.isProjectContext && (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#A6F16A]">
                <FolderGit2 className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Adding to project:{' '}
                  <span className="text-white">
                    {form.activeProject?.name || 'Project'}
                  </span>
                </span>
              </p>
            )}
          </div>
          {form.isEditMode && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Discard unsaved changes and return to records?')) {
                  form.navigate('/observations')
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase text-[#B2C8BA] hover:text-white hover:border-[#A6F16A]/50 transition-colors shadow-xs cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      )}

      {/* Observation Form Container — Vertically Stacked Collapsible Cards */}
      <div className="space-y-4">
        {/* 1. Photograph & Location Unified Collapsible Card */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('photo_location')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleSection('photo_location')
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openPhotoLocation}
            aria-label="Toggle Photograph & Location section"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Camera className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Photograph &amp; Location <span className="text-red-500 font-bold text-base">*</span>
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  form.setShowPhotoTips(true)
                }}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Tips for Great Field Photos"
                title="Tips for Great Field Photos"
              >
                <Info className="h-3 w-3" />
              </button>
              {form.photos.length > 0 && (
                <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-[11px] font-semibold text-[#A6F16A]">
                  {form.photos.length} {form.photos.length === 1 ? 'photo' : 'photos'}
                </span>
              )}
              {geo.location && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-[#133D2F] text-[#A6F16A] border-[#1C4D3C]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#A6F16A] animate-pulse" />
                  <span>{geo.locationSource === 'EXIF' ? 'EXIF Locked' : 'GPS Locked'}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openPhotoLocation ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openPhotoLocation && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70 space-y-4">
              {/* Camera and Gallery Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <label
                  htmlFor="camera-photo-input"
                  className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1C4D3C] p-3 text-center text-sm font-medium transition ${
                    form.saved
                      ? 'cursor-not-allowed bg-[#061812]/50 text-[#7B9586]'
                      : 'cursor-pointer bg-[#061812] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/50 active:scale-98 shadow-sm'
                  }`}
                >
                  <Camera className="h-4.5 w-4.5 shrink-0 text-[#A6F16A]" />
                  <span>Take Photo</span>
                </label>

                <label
                  htmlFor="gallery-photo-input"
                  className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1C4D3C] p-3 text-center text-sm font-medium transition ${
                    form.saved
                      ? 'cursor-not-allowed bg-[#061812]/50 text-[#7B9586]'
                      : 'cursor-pointer bg-[#061812] text-[#20D6A0] hover:bg-[#133D2F] hover:border-[#20D6A0]/50 active:scale-98 shadow-sm'
                  }`}
                >
                  <ImageIcon className="h-4.5 w-4.5 shrink-0 text-[#20D6A0]" />
                  <span>Choose Gallery</span>
                </label>
              </div>

              <input
                id="camera-photo-input"
                type="file"
                accept="image/*"
                capture="environment"
                
                className="hidden"
                onChange={(e) => {
                  form.handleAddPhotos(e.target.files, true)
                  e.target.value = ''
                }}
              />

              <input
                id="gallery-photo-input"
                type="file"
                accept="image/*"
                multiple
                
                className="hidden"
                onChange={(e) => {
                  form.handleAddPhotos(e.target.files, false)
                  e.target.value = ''
                }}
              />

              {/* Automatic Location Status Indicator for Photos */}
              {geo.isGettingLocation || form.isProcessingPhotos ? (
                <div className="flex items-center gap-2 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3 text-xs text-[#A6F16A]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#A6F16A] shrink-0" />
                  <span>Extracting photo EXIF GPS metadata...</span>
                </div>
              ) : form.exifWarning ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl bg-amber-950/40 border border-amber-600/50 p-3 text-xs text-amber-200">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-300">No GPS in Photo Metadata</p>
                      <p className="text-[11px] text-amber-200/80 mt-0.5">
                        {form.exifWarning}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={form.handleUseDeviceGps}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D2D22] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] font-bold text-xs shrink-0 self-start sm:self-center transition-colors cursor-pointer"
                  >
                    <MapPin className="h-3.5 w-3.5 text-[#A6F16A]" />
                    <span>Use Device GPS</span>
                  </button>
                </div>
              ) : null}

              {/* Single Unified Container: Photo Thumbnail alongside Auto-Detected Location Details */}
              {form.photoPreviews.length > 0 && (
                <div className="rounded-2xl border border-[#1C4D3C] bg-[#061812] p-3.5 sm:p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                    {/* Thumbnail Preview */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden rounded-2xl border border-[#1C4D3C] bg-[#061812] shadow-sm">
                      <img
                        src={form.photoPreviews[form.primaryPhotoIndex] || form.photoPreviews[0]}
                        alt="Observation preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          form.handleRemovePhoto(form.primaryPhotoIndex)
                        }}
                        className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-white shadow-md hover:bg-red-700 active:scale-95 cursor-pointer"
                        aria-label="Remove photo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Alongside: Auto-Detected Location Information */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {geo.location && (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            geo.locationSource === 'EXIF'
                              ? 'bg-cyan-950/70 border-cyan-600/50 text-cyan-300'
                              : 'bg-[#133D2F] border-[#20D6A0]/40 text-[#A6F16A]'
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                            <span>{geo.locationSource === 'EXIF' ? 'EXIF Locked' : 'GPS Locked'}</span>
                          </span>
                        )}

                        {geo.autoWardNumber && (
                          <span className="rounded bg-[#0D2D22] border border-[#1C4D3C] px-2 py-0.5 font-mono text-[10px] text-[#A6F16A]">
                            Ward {geo.autoWardNumber}
                          </span>
                        )}
                      </div>

                      {/* Location Name */}
                      <p className="text-base font-bold text-white truncate">
                        {geo.resolvedLocationName ||
                          (geo.isReverseGeocoding
                            ? 'Resolving place name...'
                            : geo.location
                            ? 'Location coordinates acquired'
                            : 'Location not detected')}
                      </p>

                      {/* Coordinates */}
                      {geo.location ? (
                        <div className="space-y-0.5">
                          <p className="font-mono text-xs text-[#20D6A0]">
                            {geo.location.latitude.toFixed(5)}° N, {geo.location.longitude.toFixed(5)}° E
                            {geo.locationAccuracy !== null && geo.locationSource !== 'EXIF' && (
                              <span className="text-[#B2C8BA] font-sans ml-1.5">
                                (±{Math.round(geo.locationAccuracy)}m)
                              </span>
                            )}
                          </p>
                          {geo.autoWardName && (
                            <p className="text-[11px] text-[#B2C8BA]">
                              Ward: {geo.autoWardName}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-[#7B9586]">
                          GPS not present in image EXIF. Use "Use Device GPS" above to capture location.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Multi-photo thumbnails strip if >1 photo */}
                  {form.photoPreviews.length > 1 && (
                    <div className="pt-2.5 border-t border-[#1C4D3C]/60 space-y-1.5">
                      <p className="text-[11px] text-[#B2C8BA]">
                        Tap a photo to select its location as the primary reference:
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {form.photoPreviews.map((url, idx) => {
                          const isPrimary = form.primaryPhotoIndex === idx
                          return (
                            <div
                              key={idx}
                              onClick={() => form.selectPrimaryPhoto(idx)}
                              className={`relative h-13 w-13 shrink-0 rounded-xl overflow-hidden border cursor-pointer ${
                                isPrimary
                                  ? 'border-[#A6F16A] ring-2 ring-[#A6F16A]/50'
                                  : 'border-[#1C4D3C] hover:border-[#A6F16A]/40'
                              }`}
                            >
                              <img src={url} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                              {isPrimary && (
                                <span className="absolute bottom-0 inset-x-0 bg-[#A6F16A] text-[#061812] text-[8px] font-bold text-center leading-tight py-0.5">
                                  Primary
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sleek, Space-Efficient Distance & Position Verification */}
              <div className="rounded-2xl border border-[#1C4D3C] bg-[#061812] p-3 sm:p-3.5 space-y-2.5 transition-all">
                <div className="flex items-center justify-between gap-3">
                  {/* Question Title & Subtle Info (ⓘ) Button */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      Are you at the exact spot?
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSpotInfo(!showSpotInfo)}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[#7B9586] hover:text-[#A6F16A] hover:bg-[#133D2F] transition-colors cursor-pointer shrink-0"
                      title="Position verification guidance"
                      aria-label="Toggle position verification guidance"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Sleek Horizontal Pill Toggle (Yes / No) */}
                  <div className="inline-flex items-center rounded-xl bg-[#0D2D22] p-0.5 border border-[#1C4D3C] shrink-0">
                    <button
                      type="button"
                      onClick={() => form.setIsAtExactSpot('Yes')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        form.isAtExactSpot === 'Yes'
                          ? 'bg-[#20D6A0] text-[#061812] shadow-xs'
                          : 'text-[#B2C8BA] hover:text-white'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => form.setIsAtExactSpot('No')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        form.isAtExactSpot === 'No'
                          ? 'bg-[#20D6A0] text-[#061812] shadow-xs'
                          : 'text-[#B2C8BA] hover:text-white'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Combined Explanatory Tooltip Note (revealed on ⓘ click) */}
                {showSpotInfo && (
                  <div className="rounded-xl bg-[#0D2D22] border border-[#1C4D3C]/70 p-2.5 text-[11px] text-[#B2C8BA] leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                    Indicates whether recorded coordinates mark the organism&apos;s direct position or your observation point. If observing from a distance (e.g., organisms in water, on steep terrain, or in flight), specify the estimated distance in meters.
                  </div>
                )}

                {/* Conditional Compact Input: Single line row sliding in smoothly */}
                {form.isAtExactSpot === 'No' && (
                  <div className="flex items-center gap-2.5 pt-2 border-t border-[#1C4D3C]/60 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label
                      htmlFor="estimated-distance-input"
                      className="text-xs font-medium text-[#A6F16A] shrink-0"
                    >
                      Estimated distance:
                    </label>
                    <div className="relative flex-1 max-w-[170px]">
                      <input
                        id="estimated-distance-input"
                        type="number"
                        min="1"
                        step="1"
                        value={form.estimatedDistanceMeters}
                        onChange={(e) => {
                          const val = e.target.value
                          form.setEstimatedDistanceMeters(val === '' ? '' : Math.max(1, Number(val)))
                        }}
                        placeholder="e.g. 25"
                        className="w-full h-8 rounded-lg border border-[#1C4D3C] bg-[#0D2D22] pl-2.5 pr-7 text-xs text-white placeholder-[#7B9586] focus:border-[#20D6A0] focus:outline-none focus:ring-1 focus:ring-[#20D6A0] transition-colors"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-[#7B9586] pointer-events-none">
                        m
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tips Modals */}
          <PhotoTipsModal
            isOpen={form.showPhotoTips}
            onClose={() => form.setShowPhotoTips(false)}
          />
          <LocationTipsModal
            isOpen={form.showLocationTips}
            onClose={() => form.setShowLocationTips(false)}
          />
        </section>

        {/* 3. Species & Identification Details Collapsible Card */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('species')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleSection('species')
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openSpecies}
            aria-label="Toggle Species & Identification section"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Species Details <span className="text-red-500 font-bold text-base">*</span>
              </h2>
              {form.identificationStatus && (
                <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-[11px] font-semibold text-[#A6F16A]">
                  {form.identificationStatus}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openSpecies ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openSpecies && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70 space-y-4">
              {/* Identification Status */}
              <div>
                <label
                  htmlFor="identificationStatus"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Identification Status <span className="text-red-500 font-bold">*</span>
                </label>
                <AppSelect
                  id="identificationStatus"
                  value={form.identificationStatus}
                  
                  onChange={(val) =>
                    form.handleStatusChange(val as IdentificationStatus | '')
                  }
                  placeholder="Select status..."
                  options={[
                    { value: 'Identified', label: 'Identified', hint: 'Species is clearly recognized and confirmed' },
                    { value: 'Unknown', label: 'Unknown', hint: 'Requires photo to aid identification' },
                    { value: 'Needs verification', label: 'Needs verification', hint: 'Needs expert or peer confirmation' },
                  ]}
                />
              </div>

              {/* Common Name */}
              <div>
                <label
                  htmlFor="speciesName"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
                >
                  Common Name {!form.isUnknown && <span className="text-red-500 font-bold">*</span>}
                </label>
                <input
                  id="speciesName"
                  type="text"
                  value={form.speciesName}
                  disabled={form.isUnknown}
                  onChange={(e) => form.setSpeciesName(e.target.value)}
                  placeholder={
                    form.isUnknown
                      ? 'Locked for Unknown species'
                      : 'Enter species name'
                  }
                  className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Local Name */}
              <div>
                <label
                  htmlFor="localName"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
                >
                  Local Name
                </label>
                <input
                  id="localName"
                  type="text"
                  value={form.localName}
                  disabled={form.isUnknown}
                  onChange={(e) => form.setLocalName(e.target.value)}
                  placeholder={
                    form.isUnknown ? 'Locked for Unknown species' : 'e.g., Naattu Mayil'
                  }
                  className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Scientific Name */}
              <div>
                <label
                  htmlFor="scientificName"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
                >
                  Scientific Name
                </label>
                <input
                  id="scientificName"
                  type="text"
                  value={form.scientificName}
                  disabled={form.isUnknown}
                  onChange={(e) => form.setScientificName(e.target.value)}
                  placeholder="e.g. Pavo cristatus"
                  className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base italic text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Species Group */}
              <div>
                <label
                  htmlFor="speciesGroup"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Species Group
                </label>
                <AppSelect
                  id="speciesGroup"
                  value={form.speciesGroup}
                  
                  onChange={(val) => {
                    form.setSpeciesGroup(val)
                    if (val !== 'Other') form.setOtherSpeciesGroup('')
                  }}
                  placeholder="Select Species Group..."
                  options={SPECIES_GROUPS.map((group) => ({ value: group, label: group }))}
                />

                {form.speciesGroup === 'Other' && (
                  <div className="mt-3">
                    <input
                      id="otherSpeciesGroup"
                      type="text"
                      value={form.otherSpeciesGroup}
                      
                      onChange={(event) => form.setOtherSpeciesGroup(event.target.value)}
                      placeholder="e.g. Fungi"
                      className="w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                    />
                  </div>
                )}
              </div>

              {/* Basis of Record */}
              <div className="pt-2 border-t border-[#1C4D3C]">
                <label
                  htmlFor="basisOfRecord"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Basis of Record <span className="text-red-500 font-bold">*</span>
                </label>
                <AppSelect
                  id="basisOfRecord"
                  value={form.basisOfRecord}
                  
                  onChange={(val) => form.setBasisOfRecord(val as BasisOfRecord)}
                  placeholder="Select Basis of Record..."
                  options={BASIS_OF_RECORD_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                />
              </div>
            </div>
          )}
        </section>

        {/* 4. Ecological details / population status Collapsible Card */}
        {/* Requirement 2 & 4: Renamed heading and initially collapsed to reduce clutter */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('ecology')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleSection('ecology')
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openEcology}
            aria-label="Toggle Ecological details / population status section"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Layers className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Ecological details / population status
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  form.setShowEcologyTips(true)
                }}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Tips for Ecological Details"
                title="Tips for Ecological Details"
              >
                <Info className="h-3 w-3" />
              </button>

              {/* Subtle badge indicating entered fields when collapsed */}
              {(form.habitatType || form.lifeStage || form.season) && (
                <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2 py-0.5 text-[10px] font-semibold text-[#A6F16A]">
                  {[form.habitatType, form.lifeStage, form.season].filter(Boolean).join(' • ')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openEcology ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openEcology && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70 space-y-4">
              {/* Habitat Type (Single-select dropdown) */}
              <div>
                <label
                  htmlFor="habitatType"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Habitat type
                </label>
                <AppSelect
                  id="habitatType"
                  value={form.habitatType}
                  
                  onChange={(val) => form.setHabitatType(val)}
                  placeholder="Select Habitat type..."
                  options={HABITAT_TYPES.map((type) => ({ value: type, label: type }))}
                />
              </div>

              {/* Life stage & Count grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="lifeStage"
                    className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                  >
                    Life stage
                  </label>
                  <AppSelect
                    id="lifeStage"
                    value={form.lifeStage}
                    
                    onChange={(val) => form.setLifeStage(val)}
                    placeholder="Select stage..."
                    options={ECOLOGICAL_LIFE_STAGES.map((stage) => ({ value: stage, label: stage }))}
                  />
                </div>

                <div>
                  <label
                    htmlFor="individualCount"
                    className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
                  >
                    Count <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    id="individualCount"
                    type="number"
                    min={1}
                    step={1}
                    value={form.individualCount}
                    
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      form.setIndividualCount(Number.isNaN(val) ? 1 : val)
                    }}
                    className="mt-2 w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base font-semibold text-[#F0F5EF] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                  />
                </div>
              </div>

              {/* Reproductive Attributes (Multi-select) */}
              <div>
                <label
                  htmlFor="reproductiveAttributes"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Reproductive Attributes (Multi-select)
                </label>
                <AppMultiSelect
                  id="reproductiveAttributes"
                  values={form.reproductiveAttributes}
                  
                  onChange={(vals) => form.setReproductiveAttributes(vals)}
                  placeholder="Select reproductive attributes..."
                  options={REPRODUCTIVE_ATTRIBUTES.map((attr) => ({ value: attr, label: attr }))}
                />
              </div>

              {/* Sex & Season grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="sex"
                    className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                  >
                    Sex
                  </label>
                  <AppSelect
                    id="sex"
                    value={form.sex}
                    
                    onChange={(val) => form.setSex(val)}
                    placeholder="Select sex..."
                    options={SEX_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
                  />
                </div>

                <div>
                  <label
                    htmlFor="season"
                    className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                  >
                    Season
                  </label>
                  <AppSelect
                    id="season"
                    value={form.season}
                    
                    onChange={(val) => form.setSeason(val)}
                    placeholder="Select season..."
                    options={SEASONS.map((s) => ({ value: s, label: s }))}
                  />
                </div>
              </div>

              {/* Evidence of Presence (Multi-select) */}
              <div>
                <label
                  htmlFor="evidenceOfPresence"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Evidence of Presence (Multi-select)
                </label>
                <AppMultiSelect
                  id="evidenceOfPresence"
                  values={form.evidenceOfPresence}
                  
                  onChange={(vals) => form.setEvidenceOfPresence(vals)}
                  placeholder="Select evidence of presence..."
                  options={EVIDENCE_OF_PRESENCE.map((ev) => ({ value: ev, label: ev }))}
                />
              </div>

              {/* Micro-habitat / Substrate (Existing field preserved) */}
              <div>
                <label
                  htmlFor="microHabitat"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Micro-habitat / Substrate
                </label>
                <AppSelect
                  id="microHabitat"
                  value={form.microHabitat}
                  
                  onChange={(val) => form.handleMicroHabitatChange(val)}
                  placeholder="Select substrate..."
                  options={MICRO_HABITATS.map((habitat) => ({ value: habitat, label: habitat }))}
                />

                {form.microHabitat === 'Other' && (
                  <div className="mt-3">
                    <input
                      id="otherMicroHabitat"
                      type="text"
                      value={form.otherMicroHabitat}
                      
                      onChange={(e) => form.setOtherMicroHabitat(e.target.value)}
                      placeholder="e.g. Canopy layer"
                      className="w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                    />
                  </div>
                )}
              </div>

              {/* Organism Status (Existing field preserved) */}
              <div>
                <label
                  htmlFor="organismStatus"
                  className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                >
                  Organism Status
                </label>
                <AppSelect
                  id="organismStatus"
                  value={form.organismStatus}
                  
                  onChange={(val) => form.setOrganismStatus(val as OrganismStatus | '')}
                  placeholder="Select organism status..."
                  options={ORGANISM_STATUSES.map((status) => ({ value: status, label: status }))}
                />
              </div>
            </div>
          )}

          {/* Tips for Ecological Details Modal */}
          <EcologyTipsModal
            isOpen={form.showEcologyTips}
            onClose={() => form.setShowEcologyTips(false)}
          />
        </section>

        {/* 5. Traditional Knowledge Collapsible Card */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('tk')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleSection('tk')
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openTk}
            aria-label="Toggle Traditional Knowledge section"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <BookOpen className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Traditional Knowledge
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  form.setShowTkTips(true)
                }}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="What is Traditional Knowledge?"
                title="What is Traditional Knowledge?"
              >
                <Info className="h-3 w-3" />
              </button>

              {form.hasTraditionalKnowledge && (
                <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-[11px] font-semibold text-[#A6F16A]">
                  Associated: {form.hasTraditionalKnowledge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openTk ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openTk && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70">
              <label
                htmlFor="hasTraditionalKnowledge"
                className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
              >
                Is traditional knowledge associated?
              </label>
              <AppSelect
                id="hasTraditionalKnowledge"
                value={form.hasTraditionalKnowledge}
                
                onChange={(val) =>
                  form.handleTraditionalKnowledgeChange(val as YesNo | '')
                }
                placeholder="Select Yes or No..."
                options={[
                  { value: 'Yes', label: 'Yes' },
                  { value: 'No', label: 'No' },
                ]}
              />

              {form.hasTraditionalKnowledge === 'Yes' && (
                <div className="mt-3 space-y-3 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-4 text-base">
                  <div>
                    <label
                      htmlFor="traditionalKnowledgeSource"
                      className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2"
                    >
                      Source of Knowledge <span className="text-red-500 font-bold">*</span>
                    </label>
                    <AppSelect
                      id="traditionalKnowledgeSource"
                      value={form.traditionalKnowledgeSource}
                      
                      onChange={(val) => form.handleTraditionalKnowledgeSourceChange(val)}
                      placeholder="Select source..."
                      options={TRADITIONAL_KNOWLEDGE_SOURCES.map((source) => ({ value: source, label: source }))}
                    />
                  </div>

                  {form.traditionalKnowledgeSource === 'Other' && (
                    <div>
                      <input
                        id="otherTraditionalKnowledgeSource"
                        type="text"
                        value={form.otherTraditionalKnowledgeSource}
                        
                        onChange={(e) =>
                          form.setOtherTraditionalKnowledgeSource(e.target.value)
                        }
                        placeholder="e.g. Village elder"
                        className="w-full min-h-[48px] rounded-xl border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-2.5 text-base text-[#F0F5EF] placeholder-[#7B9586]"
                      />
                    </div>
                  )}

                  <p className="text-xs text-[#7B9586] leading-relaxed pt-1">
                    Community consent: Do not record private phone numbers or personal identifying details.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* What is Traditional Knowledge Modal */}
          <TraditionalKnowledgeTipsModal
            isOpen={form.showTkTips}
            onClose={() => form.setShowTkTips(false)}
          />
        </section>

        {/* 6. Notes Collapsible Card */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('notes')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleSection('notes')
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openNotes}
            aria-label="Toggle Field Notes section"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <FileText className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Field Notes
              </h2>
              {form.notes.trim() && (
                <span className="rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-0.5 text-[11px] font-semibold text-[#A6F16A]">
                  Notes added
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openNotes ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openNotes && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70">
              <label
                htmlFor="notes"
                className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]"
              >
                Observer Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                
                onChange={(e) => form.setNotes(e.target.value)}
                placeholder="Add brief notes"
                className="mt-2 w-full rounded-xl border border-[#1C4D3C] bg-[#061812] px-4 py-3 text-base text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}
        </section>

        {/* 7. Tags Collapsible Card */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('tags')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleSection('tags')
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openTags}
            aria-label="Toggle Tags section"
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              <TagIcon className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Tags
              </h2>
              {form.tags.length > 0 && (
                <span className="rounded-full bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C] px-2.5 py-0.5 text-xs font-semibold">
                  {form.tags.length} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openTags ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openTags && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70">
              <TagSelector
                selectedTagIds={form.tags}
                onChange={(newTags) => form.setTags(newTags)}
                
              />
            </div>
          )}
        </section>

        {/* 8. Location Visibility Collapsible Card */}
        <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('visibility')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleSection('visibility')
              }
            }}
            className="flex items-center justify-between cursor-pointer select-none"
            aria-expanded={openVisibility}
            aria-label="Toggle Location Visibility section"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Eye className="h-5 w-5 text-[#A6F16A] shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Location Visibility
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  form.setShowVisibilityHelp(!form.showVisibilityHelp)
                }}
                className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] transition-colors cursor-pointer shrink-0"
                aria-label="Toggle visibility help"
                title="Toggle visibility help"
              >
                <Info className="h-3 w-3" />
              </button>

              {form.locationVisibility && (
                <span className="rounded-full bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C] px-2.5 py-0.5 text-xs font-semibold">
                  {form.locationVisibility}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {openVisibility ? (
                <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
              )}
            </div>
          </div>

          {openVisibility && (
            <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70">
              {form.showVisibilityHelp && (
                <div className="mb-3.5 rounded-2xl bg-[#061812] border border-[#1C4D3C] px-4 py-3 text-xs text-[#B2C8BA] leading-relaxed space-y-2">
                  <p className="font-semibold text-white">What does each option mean?</p>
                  {LOCATION_VISIBILITIES.map((opt) => (
                    <div key={opt.value} className="flex gap-2">
                      <span className="font-semibold text-[#A6F16A] shrink-0">{opt.label}:</span>
                      <span>{opt.description}</span>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="space-y-2.5"
                role="radiogroup"
                aria-label="Location Visibility Options"
              >
                {LOCATION_VISIBILITIES.map((opt) => {
                  const isSelected = form.locationVisibility === opt.value
                  return (
                    <div
                      key={opt.value}
                      role="radio"
                      aria-checked={isSelected}
                      
                      onClick={() => {
                                                form.setLocationVisibility(isSelected ? '' : opt.value)
                      }}
                      onKeyDown={(e) => {
                                                if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault()
                          form.setLocationVisibility(isSelected ? '' : opt.value)
                        }
                      }}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all select-none ${
                        ''
                      } ${
                        isSelected
                          ? 'border-[#A6F16A] bg-[#133D2F] shadow-md shadow-[#061812]/50'
                          : 'border-[#1C4D3C] bg-[#061812] hover:border-[#A6F16A]/40 hover:bg-[#0D2D22]'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? 'border-[#A6F16A] bg-[#A6F16A]'
                            : 'border-[#1C4D3C] bg-[#061812]'
                        }`}
                      >
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#061812]" />}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          isSelected ? 'text-white' : 'text-[#B2C8BA]'
                        }`}
                      >
                        {opt.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        {/* 9. Add to project(s) Collapsible Card (hidden when inside a project context) */}
        {!form.isProjectContext && (
          <section className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] transition-all">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleSection('projects')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleSection('projects')
                }
              }}
              className="flex items-center justify-between cursor-pointer select-none"
              aria-expanded={openProjects}
              aria-label="Toggle Projects section"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <FolderGit2 className="h-5 w-5 text-[#A6F16A] shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Add to project(s)
                </h2>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    form.setShowProjectTips(!form.showProjectTips)
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-[#061812] border border-[#1C4D3C] text-[#A6F16A] hover:bg-[#133D2F] hover:border-[#A6F16A]/60 hover:text-white transition-colors cursor-pointer shrink-0"
                  aria-label={
                    form.showProjectTips
                      ? 'Hide project information'
                      : 'About adding to projects'
                  }
                  aria-expanded={form.showProjectTips}
                  title="About adding to projects"
                >
                  <Info className="h-3 w-3" />
                </button>
                {form.selectedProjectIds.length > 0 && (
                  <span className="rounded-full bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C] px-2.5 py-0.5 text-xs font-semibold">
                    {form.selectedProjectIds.length} selected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {openProjects ? (
                  <ChevronUp className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#A6F16A] transition-transform duration-200" />
                )}
              </div>
            </div>

            {openProjects && (
              <div className="mt-4 pt-3.5 border-t border-[#1C4D3C]/70 space-y-3.5">
                {form.showProjectTips && (
                  <div
                    role="region"
                    aria-label="Project association information"
                    className="rounded-2xl bg-[#061812] border border-[#1C4D3C] p-3.5 text-xs text-[#B2C8BA] leading-relaxed flex items-start gap-2.5"
                  >
                    <Info className="h-4 w-4 text-[#A6F16A] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-white">About Project Association</p>
                      <p className="mt-0.5 text-[#B2C8BA]">
                        Associate this observation with one or more community biodiversity projects.
                        Adding to projects is optional.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => form.setShowProjectTips(false)}
                      className="text-[#7B9586] hover:text-white p-0.5 transition-colors cursor-pointer"
                      aria-label="Close information"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Selected Projects as Chips */}
                {form.selectedProjectIds.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-[#7B9586]">
                      Selected Projects ({form.selectedProjectIds.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {form.selectedProjectIds.map((pId) => {
                        const proj = form.allProjects.find((p) => p.id === pId)
                        return (
                          <span
                            key={pId}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#133D2F] border border-[#A6F16A]/50 px-3 py-1 text-xs font-medium text-[#F0F5EF] shadow-xs"
                          >
                            <span className="truncate max-w-[200px]">
                              {proj ? proj.name : pId}
                            </span>
                            <button
                              type="button"
                              onClick={() => form.handleRemoveProject(pId)}
                              className="rounded-full p-0.5 hover:bg-[#061812] text-[#A6F16A] hover:text-rose-400 transition-colors cursor-pointer"
                              aria-label={`Remove project ${proj ? proj.name : pId}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Search projects input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B9586]" />
                  <input
                    type="text"
                    value={form.projectSearchQuery}
                    
                    onChange={(e) => form.setProjectSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full min-h-[44px] rounded-xl border border-[#1C4D3C] bg-[#061812] pl-10 pr-9 py-2.5 text-sm text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                  />
                  {form.projectSearchQuery && (
                    <button
                      type="button"
                      onClick={() => form.setProjectSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B9586] hover:text-white cursor-pointer"
                      aria-label="Clear project search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Available Projects List */}
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 rounded-xl">
                  {form.allProjects.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#1C4D3C] p-4 text-center text-xs text-[#7B9586]">
                      <p>No projects available yet.</p>
                    </div>
                  ) : form.filteredProjects.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#1C4D3C] p-4 text-center text-xs text-[#7B9586]">
                      <p>No projects match &quot;{form.projectSearchQuery}&quot;.</p>
                    </div>
                  ) : (
                    form.filteredProjects.map((proj) => {
                      const isSelected = form.selectedProjectIds.includes(proj.id)
                      return (
                        <div
                          key={proj.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => form.handleToggleProject(proj.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              form.handleToggleProject(proj.id)
                            }
                          }}
                          className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#133D2F]/70 border-[#A6F16A] text-white shadow-xs'
                              : 'bg-[#061812] border-[#1C4D3C] text-[#B2C8BA] hover:border-[#A6F16A]/40'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm truncate text-white">
                                {proj.name}
                              </span>
                              <span className="text-[10px] capitalize px-2 py-0.5 rounded-full bg-[#0D2D22] border border-[#1C4D3C] text-[#7B9586]">
                                {proj.status || 'Active'}
                              </span>
                            </div>
                            {(proj.organization || proj.targetRegion) && (
                              <p className="text-xs text-[#7B9586] truncate mt-0.5">
                                {[proj.organization, proj.targetRegion].filter(Boolean).join(' • ')}
                              </p>
                            )}
                          </div>
                          <span
                            className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-[#A6F16A] text-[#061812] font-bold'
                                : 'bg-[#0D2D22] text-[#B2C8BA] border border-[#1C4D3C]'
                            }`}
                          >
                            {isSelected ? 'Selected ✓' : '+ Select'}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 10. Streamlined Submit Observation Button */}
        <section className="pt-2 pb-6">
          <Button
            type="button"
            className="w-full min-h-[54px] font-extrabold text-base sm:text-lg tracking-wider uppercase rounded-2xl transition-all shadow-xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] hover:opacity-95 text-[#061812] shadow-[#20D6A0]/25 active:scale-[0.98] cursor-pointer"
            disabled={form.isSaving}
            onClick={handleOpenConfirm}
          >
            {form.isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin text-[#061812]" />
                <span>{form.isEditMode ? 'Updating Record...' : 'Submitting Observation...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2 text-[#061812]" />
                <span>{form.isEditMode ? 'Save Changes' : 'Submit Observation'}</span>
              </>
            )}
          </Button>
        </section>
      </div>

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-message"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-2xl shadow-black/80 text-[#F0F5EF]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#133D2F] border border-[#1C4D3C] text-[#A6F16A] mb-3 shadow-md">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <p id="confirm-modal-message" className="text-sm sm:text-base font-semibold text-white text-center leading-relaxed px-1">
              Are you sure you want to submit this observation?
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={form.isSaving}
                onClick={() => setShowConfirmModal(false)}
                className="min-h-[46px] rounded-xl border-[#1C4D3C] bg-[#061812] px-4 py-2.5 text-sm font-semibold tracking-wider uppercase text-[#B2C8BA] hover:bg-[#133D2F] hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={form.isSaving}
                onClick={handleConfirmSubmit}
                className="min-h-[46px] rounded-xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] px-4 py-2.5 text-sm font-extrabold tracking-wider uppercase text-[#061812] hover:opacity-95 shadow-lg shadow-[#20D6A0]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {form.isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#061812]" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>OK</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
