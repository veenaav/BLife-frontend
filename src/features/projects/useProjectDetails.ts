import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type Project, type Observation } from '@/db/database'
import { getJoinedProjectIds, toggleJoinedProject } from '@/lib/projectStorage'
import { updateProjectOnBackend, deleteProjectOnBackend } from '@/lib/apiService'

export type MockUserRole = 'admin' | 'project_expert' | 'field_worker'

export function useProjectDetails(projectId?: string) {
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [projectObservations, setProjectObservations] = useState<Observation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // User permission role securely locked to Field Worker mode
  const userRole: MockUserRole = 'field_worker'
  const canManageProject = false
  const [isJoined, setIsJoined] = useState(() => (projectId ? getJoinedProjectIds().includes(projectId) : false))

  // Project editing modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editOrganization, setEditOrganization] = useState('')
  const [editTargetRegion, setEditTargetRegion] = useState('')
  const [editDistrict, setEditDistrict] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState<'active' | 'completed' | 'archived'>('active')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const isAuthorizedContributor = isJoined || canManageProject

  const loadData = useCallback(async () => {
    if (!projectId) return
    setIsLoading(true)
    try {
      setIsJoined(getJoinedProjectIds().includes(projectId))

      const proj = await db.projects.get(projectId)
      if (proj) {
        setProject(proj)
        setEditName(proj.name)
        setEditOrganization(proj.organization || '')
        setEditTargetRegion(proj.targetRegion || '')
        setEditDistrict(proj.district || '')
        setEditDescription(proj.description || '')
        setEditStatus(proj.status || 'active')
      }

      // Load all observations belonging to this project (supporting scalar & array projectIds)
      const allObs = await db.observations.toArray()
      const obsList = allObs.filter(
        (obs) =>
          obs.projectId === projectId ||
          (obs.projectIds && obs.projectIds.includes(projectId))
      )
      const sortedObs = [...obsList].sort((a, b) => {
        const tA = new Date(b.createdAt || b.recordedAt || 0).getTime() || 0
        const tB = new Date(a.createdAt || a.recordedAt || 0).getTime() || 0
        return tA - tB
      })
      setProjectObservations(sortedObs)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggleJoin = () => {
    if (!projectId) return
    const updated = toggleJoinedProject(projectId)
    setIsJoined(updated.includes(projectId))
  }

  const handleRoleChange = (_role: MockUserRole) => {
    // Role is securely locked to field_worker mode
  }

  const handleRecordObservationClick = () => {
    if (!projectId) return
    if (!isAuthorizedContributor) {
      const confirmJoin = window.confirm(
        'You need to be a project member to record observations for this project. Would you like to join now and proceed?'
      )
      if (confirmJoin) {
        toggleJoinedProject(projectId)
        setIsJoined(true)
        navigate(`/new-observation?projectId=${projectId}`)
      }
      return
    }
    navigate(`/new-observation?projectId=${projectId}`)
  }

  const handleSaveProjectEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !editName.trim()) {
      alert('Please provide a valid project name.')
      return
    }

    setIsSavingEdit(true)
    try {
      const now = new Date().toISOString()
      const cleanDesc = editDescription.trim()
      const updates = {
        name: editName.trim(),
        organization: editOrganization.trim() || undefined,
        targetRegion: editTargetRegion.trim() || undefined,
        district: editDistrict.trim() || undefined,
        description: cleanDesc || undefined,
        status: editStatus,
        updatedAt: now,
      }

      let syncStatus: 'synced' | 'pending' = 'pending'
      try {
        await updateProjectOnBackend(project.id, updates)
        syncStatus = 'synced'
      } catch (backendErr) {
        console.warn('[useProjectDetails] NeoDB direct update failed, queued locally:', backendErr)
      }

      await db.projects.update(project.id, {
        ...updates,
        syncStatus,
      })

      setProject((prev) => (prev ? { ...prev, ...updates, syncStatus } : null))
      setShowEditModal(false)
      await loadData()
    } catch (err) {
      alert(`Failed to update project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return
    const confirmed = window.confirm(
      'Are you sure you want to delete this entire project and its associated local records? This action cannot be undone.'
    )
    if (!confirmed) return

    try {
      try {
        await deleteProjectOnBackend(project.id)
      } catch (backendErr) {
        console.warn('[useProjectDetails] Backend delete queued/failed:', backendErr)
      }

      await db.projects.delete(project.id)
      const currentJoined = getJoinedProjectIds()
      if (currentJoined.includes(project.id)) {
        toggleJoinedProject(project.id)
      }
      navigate('/projects')
    } catch (err) {
      alert(`Failed to delete project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return {
    project,
    projectObservations,
    isLoading,
    userRole,
    handleRoleChange,
    canManageProject,
    isJoined,
    handleToggleJoin,
    isAuthorizedContributor,
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
  }
}
