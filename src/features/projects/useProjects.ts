import { useEffect, useState } from 'react'
import { db, type Project } from '@/db/database'
import {
  getJoinedProjectIds,
  toggleJoinedProject,
  countProjectObservations,
} from '@/lib/projectStorage'
import { generateId } from '@/lib/utils'
import {
  fetchProjectsFromBackend,
  createProjectOnBackend,
  deleteProjectOnBackend,
} from '@/lib/apiService'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [joinedIds, setJoinedIds] = useState<string[]>(getJoinedProjectIds())
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all')
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)
  const [observationCounts, setObservationCounts] = useState<Record<string, number>>({})
  const [showAddForm, setShowAddForm] = useState(false)

  // New project form state
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [targetRegion, setTargetRegion] = useState('')
  const [district, setDistrict] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load projects from local IndexedDB and sync with NeoDB backend
  const loadProjects = async () => {
    setJoinedIds(getJoinedProjectIds())
    const localList = await db.projects.toArray()
    setProjects(localList.reverse())

    const allObservations = await db.observations.toArray()
    const obsCounts: Record<string, number> = {}
    for (const p of localList) {
      obsCounts[p.id] = countProjectObservations(p.id, allObservations)
    }
    setObservationCounts(obsCounts)

    // Sync with remote NeoDB in background if online
    try {
      const serverProjects = await fetchProjectsFromBackend()
      if (serverProjects && Array.isArray(serverProjects)) {
        for (const sp of serverProjects) {
          const existing = await db.projects.get(sp.id)
          await db.projects.put({
            id: sp.id,
            name: sp.name || existing?.name || '',
            organization: sp.organization !== undefined ? sp.organization : existing?.organization,
            targetRegion: sp.targetRegion !== undefined ? sp.targetRegion : existing?.targetRegion,
            district: sp.district !== undefined ? sp.district : existing?.district,
            // Preserve complete description without accidental overwrites
            description: sp.description !== undefined ? sp.description : existing?.description,
            status: sp.status || existing?.status || 'active',
            startDate: sp.startDate || existing?.startDate,
            createdAt: sp.createdAt || existing?.createdAt || new Date().toISOString(),
            updatedAt: sp.updatedAt || existing?.updatedAt || new Date().toISOString(),
            syncStatus: 'synced',
          })
        }
        const updatedList = await db.projects.toArray()
        setProjects(updatedList.reverse())

        const updatedObs = await db.observations.toArray()
        const updatedCounts: Record<string, number> = {}
        for (const p of updatedList) {
          updatedCounts[p.id] = countProjectObservations(p.id, updatedObs)
        }
        setObservationCounts(updatedCounts)
      }
    } catch (err) {
      // Offline mode or server unavailable - local store is authoritative
      console.info('[useProjects] Offline or backend unreachable, using local database cache:', err)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  // Create a new project (validated, saved to NeoDB and cached in IndexedDB)
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter a project name.')
      return
    }

    setIsSubmitting(true)
    try {
      const newId = generateId()
      const now = new Date().toISOString()
      // Preserve full multi-line description without truncation or loss of paragraph breaks
      const cleanDescription = description.trim()
      const payload: Project = {
        id: newId,
        name: name.trim(),
        organization: organization.trim() || undefined,
        targetRegion: targetRegion.trim() || undefined,
        district: district.trim() || undefined,
        description: cleanDescription || undefined,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      }

      // Try persisting directly to NeoDB
      try {
        const savedServer = await createProjectOnBackend({
          id: newId,
          name: payload.name,
          organization: payload.organization,
          targetRegion: payload.targetRegion,
          district: payload.district,
          description: payload.description,
          status: payload.status,
          syncStatus: 'synced',
        })
        payload.syncStatus = 'synced'
        if (savedServer.id) payload.id = savedServer.id
      } catch (backendErr) {
        console.warn('[useProjects] NeoDB direct write queued locally:', backendErr)
        payload.syncStatus = 'pending'
      }

      await db.projects.put(payload)
      setName('')
      setOrganization('')
      setTargetRegion('')
      setDistrict('')
      setDescription('')
      setShowAddForm(false)
      await loadProjects()
    } catch (err) {
      alert(`Failed to create project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create quick sample project (helpful for first-time use)
  const handleCreateSampleProject = async () => {
    const newId = generateId()
    const now = new Date().toISOString()
    const sampleProj: Project = {
      id: newId,
      name: 'Thiruvananthapuram City Biodiversity Register',
      organization: 'Kerala State Biodiversity Board',
      targetRegion: 'Thiruvananthapuram Municipal Corporation',
      description:
        'Comprehensive municipal ward-level documentation of urban flora, fauna, and local biodiversity.',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    }

    try {
      await createProjectOnBackend({
        id: newId,
        name: sampleProj.name,
        organization: sampleProj.organization,
        targetRegion: sampleProj.targetRegion,
        description: sampleProj.description,
        status: sampleProj.status,
      })
      sampleProj.syncStatus = 'synced'
    } catch (err) {
      console.warn('[useProjects] Sample project stored locally, sync pending:', err)
    }

    await db.projects.put(sampleProj)
    await loadProjects()
  }

  // Delete project from NeoDB and local store
  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    const confirmed = window.confirm(
      'Are you sure you want to delete this project? Associated records will be removed.'
    )
    if (!confirmed) return

    try {
      try {
        await deleteProjectOnBackend(projectId)
      } catch (backendErr) {
        console.warn('[useProjects] Could not delete from backend immediately:', backendErr)
      }
      await db.projects.delete(projectId)
      const currentJoined = getJoinedProjectIds()
      if (currentJoined.includes(projectId)) {
        toggleJoinedProject(projectId)
      }
      await loadProjects()
    } catch (err) {
      alert(`Failed to delete project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const hasProjects = projects.length > 0

  const displayedProjects =
    activeTab === 'my'
      ? projects.filter((p) => joinedIds.includes(p.id))
      : projects

  return {
    projects,
    joinedIds,
    activeTab,
    setActiveTab,
    expandedProjectId,
    setExpandedProjectId,
    observationCounts,
    showAddForm,
    setShowAddForm,
    name,
    setName,
    organization,
    setOrganization,
    targetRegion,
    setTargetRegion,
    district,
    setDistrict,
    description,
    setDescription,
    isSubmitting,
    handleCreateProject,
    handleCreateSampleProject,
    handleDeleteProject,
    hasProjects,
    displayedProjects,
  }
}
