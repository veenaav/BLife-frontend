import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AppSelect } from '@/components/ui/select'
import {
  ArrowLeft,
  MapPin,
  Leaf,
  Calendar,
  Building2,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  X,
  UserCheck,
  BookOpen,
} from 'lucide-react'
import { useProjectDetails, KERALA_DISTRICTS } from '@/features/projects'

function WardsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const {
    project,
    projectObservations,
    isLoading,
    canManageProject,
    isJoined,
    handleToggleJoin,
    handleRecordObservationClick,
    showEditModal,
    setShowEditModal,
    editName,
    setEditName,
    editOrganization,
    setEditOrganization,
    editTargetRegion,
    setEditTargetRegion,
    editDistrict,
    setEditDistrict,
    editDescription,
    setEditDescription,
    editStatus,
    setEditStatus,
    isSavingEdit,
    handleSaveProjectEdit,
    handleDeleteProject,
  } = useProjectDetails(projectId)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-[#7B9586]">
        <p className="text-base">Loading project details...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-[#B2C8BA]">
        <p className="text-base">Project not found.</p>
        <Link to="/projects" className="mt-3 inline-block text-base text-[#A6F16A] font-semibold hover:underline">
          ← Back to Projects
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 text-[#F0F5EF] space-y-5">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7B9586] flex-wrap">
        <Link to="/projects" className="inline-flex items-center gap-1 text-[#A6F16A] font-semibold hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Projects</span>
        </Link>
        <span>/</span>
        <span className="text-[#B2C8BA] truncate max-w-[200px]">
          {project.name}
        </span>
        <span>/</span>
        <span className="font-semibold text-white">Details</span>
      </nav>

      {/* Project Details Container Card */}
      <div className="rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-xl shadow-[#061812]/50 text-[#F0F5EF] space-y-4">
        {/* Project Header & Minimalist Controls */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              {project.name}
            </h1>

            {project.organization && (
              <p className="flex items-center gap-1.5 text-xs sm:text-sm text-[#B2C8BA]">
                <Building2 className="h-4 w-4 text-[#20D6A0] shrink-0" />
                <span>{project.organization}</span>
              </p>
            )}

            {(project.targetRegion || project.district) && (
              <p className="flex items-center gap-1.5 text-xs sm:text-sm text-[#B2C8BA]">
                <MapPin className="h-4 w-4 text-[#A6F16A] shrink-0" />
                <span>{[project.targetRegion, project.district].filter(Boolean).join(', ')}</span>
              </p>
            )}
          </div>

          {/* Minimalist Controls: Compact Icon-only Edit and Delete */}
          {canManageProject && (
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#061812] border border-[#1C4D3C] hover:border-[#A6F16A]/60 text-[#B2C8BA] hover:text-[#A6F16A] transition-all active:scale-95 cursor-pointer"
                title="Edit Project"
                aria-label="Edit Project"
              >
                <Edit3 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleDeleteProject}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#061812] border border-[#1C4D3C] hover:border-rose-800/80 text-[#B2C8BA] hover:text-rose-400 transition-all active:scale-95 cursor-pointer"
                title="Delete Project"
                aria-label="Delete Project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Description & Objectives */}
        <div className="mt-2 rounded-2xl bg-[#061812] border border-[#1C4D3C] p-4 text-xs sm:text-sm text-[#F0F5EF] leading-relaxed shadow-inner space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#A6F16A] font-bold text-xs uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Project Details / Objectives</span>
          </div>
          {project.description && project.description.trim() ? (
            <div className="whitespace-pre-wrap break-words leading-relaxed text-[#F0F5EF]">
              {project.description}
            </div>
          ) : (
            <p className="italic text-[#7B9586]">
              No project description provided.
            </p>
          )}
        </div>

        {/* Action Button: Pre-Join ('Join Project') / Post-Join ('Start Observation') */}
        <div className="pt-3 border-t border-[#1C4D3C] flex items-center justify-between gap-3 flex-wrap">
          {!isJoined ? (
            <Button
              type="button"
              onClick={handleToggleJoin}
              className="w-full sm:w-auto min-h-[44px] px-6 inline-flex items-center justify-center gap-2 font-bold text-sm rounded-xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 shadow-md shadow-[#20D6A0]/20 active:scale-95 transition-all cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              <span>Join Project</span>
            </Button>
          ) : (
            <div className="flex items-center justify-between w-full gap-3 flex-wrap">
              <Button
                type="button"
                onClick={handleRecordObservationClick}
                className="w-full sm:w-auto min-h-[44px] px-6 inline-flex items-center justify-center gap-2 font-bold text-sm rounded-xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 shadow-md shadow-[#20D6A0]/20 active:scale-95 transition-all cursor-pointer"
                title="Record observation for this project"
              >
                <Plus className="h-4 w-4" />
                <span>Start Observation</span>
              </Button>

              <button
                type="button"
                onClick={handleToggleJoin}
                title="Click to leave project"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#7B9586] hover:text-rose-400 bg-[#061812] border border-[#1C4D3C] hover:border-rose-900 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#A6F16A]" />
                <span>Joined</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
      {showEditModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-project-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-[#1C4D3C] bg-[#0D2D22] p-5 sm:p-6 shadow-2xl shadow-black/80 text-[#F0F5EF]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1C4D3C] pb-3.5">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-[#A6F16A]" />
                <h3 id="edit-project-title" className="text-base sm:text-lg font-bold text-white">
                  Edit Project Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#B2C8BA] hover:text-white hover:bg-[#133D2F] transition-colors cursor-pointer"
                aria-label="Close edit modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectEdit} className="mt-4 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label htmlFor="editProjName" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                  Project Name <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="editProjName"
                  type="text"
                  required
                  value={editName}
                  placeholder="Project Name"
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-3.5 py-2.5 text-base text-[#F0F5EF] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                />
              </div>

              <div>
                <label htmlFor="editOrg" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                  Organization / Institution
                </label>
                <input
                  id="editOrg"
                  type="text"
                  value={editOrganization}
                  onChange={(e) => setEditOrganization(e.target.value)}
                  placeholder="Organization / Institution"
                  className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-3.5 py-2.5 text-sm text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="editRegion" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                    Target Region
                  </label>
                  <input
                    id="editRegion"
                    type="text"
                    value={editTargetRegion}
                    onChange={(e) => setEditTargetRegion(e.target.value)}
                    placeholder="Target Region"
                    className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#1C4D3C] bg-[#061812] px-3.5 py-2.5 text-sm text-[#F0F5EF] placeholder-[#7B9586] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A]"
                  />
                </div>

                <div>
                  <label htmlFor="editDistrict" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                    District
                  </label>
                  <div className="mt-1.5">
                    <AppSelect
                      id="editDistrict"
                      value={editDistrict}
                      onChange={(val) => setEditDistrict(val)}
                      placeholder="Select District..."
                      options={KERALA_DISTRICTS.map((d) => ({ value: d, label: d }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="editStatusSelect" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA] mb-2">
                  Project Status
                </label>
                <AppSelect
                  id="editStatusSelect"
                  value={editStatus}
                  onChange={(val) => setEditStatus(val as 'active' | 'completed' | 'archived')}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />
              </div>

              <div>
                <label htmlFor="editDesc" className="block text-xs font-semibold tracking-wider uppercase text-[#B2C8BA]">
                  Description &amp; Objectives
                </label>
                <textarea
                  id="editDesc"
                  rows={4}
                  value={editDescription}
                  placeholder="Description & Objectives"
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#1C4D3C] bg-[#061812] px-3.5 py-2.5 text-sm text-[#F0F5EF] outline-none focus:border-[#A6F16A] focus:ring-1 focus:ring-[#A6F16A] resize-y min-h-[100px] leading-relaxed whitespace-pre-wrap"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="border-[#1C4D3C] bg-[#061812] text-[#B2C8BA] hover:bg-[#133D2F] hover:text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingEdit}
                  className="bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] hover:opacity-95 text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Observations Section (Post-Join State) */}
      {isJoined && (
        <div className="border-t border-[#1C4D3C] pt-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-4.5 w-4.5 text-[#A6F16A]" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Project Observations
              </h2>
            </div>
            <span className="text-xs text-[#7B9586]">
              {projectObservations.length} {projectObservations.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          {projectObservations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1C4D3C] bg-[#0D2D22] p-6 text-center text-xs text-[#7B9586] shadow-sm">
              <p>No observations recorded in this project yet.</p>
              <p className="mt-1 text-[11px] text-[#7B9586]">
                Tap &quot;Start Observation&quot; above to log species directly in the field.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {projectObservations.map((obs) => {
                const photoBlob = obs.photos?.[0] || obs.photo
                const hasPhoto = photoBlob instanceof Blob
                const previewUrl = hasPhoto ? URL.createObjectURL(photoBlob) : null

                return (
                  <div
                    key={obs.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => obs.id && navigate(`/observations/${obs.id}`)}
                    className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-3.5 flex items-center gap-3 text-[#F0F5EF] shadow-md hover:border-[#A6F16A]/40 transition-colors cursor-pointer"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#1C4D3C] bg-[#061812]">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={obs.speciesName || 'Species'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Leaf className="h-5 w-5 text-[#1C4D3C]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#133D2F] px-2 py-0.5 text-[10px] font-semibold text-[#A6F16A] border border-[#1C4D3C] uppercase">
                          {obs.identificationStatus || 'Record'}
                        </span>
                        {obs.speciesGroup && (
                          <span className="text-xs text-[#7B9586] truncate">
                            • {obs.speciesGroup}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white truncate mt-0.5">
                        {obs.speciesName}
                      </h3>
                      {obs.localName && (
                        <p className="text-xs text-[#B2C8BA] truncate">{obs.localName}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-[#7B9586] shrink-0">
                      <span className="flex items-center gap-1 font-medium text-[#B2C8BA]">
                        <Calendar className="h-3 w-3 text-[#20D6A0]" />
                        {new Date(obs.recordedAt || obs.createdAt || 0).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default WardsPage
