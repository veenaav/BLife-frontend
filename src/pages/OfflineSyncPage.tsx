import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Database,
  CheckCircle2,
  Download,
} from 'lucide-react'
import { db } from '@/db/database'
import { downloadDarwinCoreExport } from '@/lib/darwinCoreExport'
import { useProfile } from '@/context/ProfileContext'
import { getCurrentUserId } from '@/lib/profileService'

interface OfflineSyncPageProps {
  onBack?: () => void
}

export default function OfflineSyncPage({ onBack }: OfflineSyncPageProps) {
  const { profile } = useProfile()
  const currentUserId = profile?.id || getCurrentUserId()

  const [observationCount, setObservationCount] = useState<number | null>(null)
  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [surveyCount, setSurveyCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    try {
      const [allObs, projCount, survCount] = await Promise.all([
        db.observations.toArray(),
        db.projects.count(),
        db.surveys.count(),
      ])
      const userObs = allObs.filter(
        (obs) => (obs.observer_id || obs.observerId || 'bliffe-demo-user') === currentUserId
      )
      setObservationCount(userObs.length)
      setProjectCount(projCount)
      setSurveyCount(survCount)
    } catch (err) {
      console.error('Failed to load storage counts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentUserId])

  const handleExportAll = async () => {
    try {
      const allObservations = await db.observations.toArray()
      const userObservations = allObservations.filter(
        (obs) => (obs.observer_id || obs.observerId || 'bliffe-demo-user') === currentUserId
      )
      downloadDarwinCoreExport(userObservations)
    } catch (err) {
      alert('Failed to export dataset: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-[#F0F5EF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C4D3C]/70 pb-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-[28px] font-bold tracking-wide text-white">
            Offline Data & Storage
          </h1>
        </div>

        {!onBack && (
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1C4D3C] bg-[#0D2D22] px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#F0F5EF] hover:bg-[#133D2F] transition-colors shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#A6F16A]" />
            <span>Dashboard</span>
          </Link>
        )}
      </div>

      {/* Streamlined Storage Card */}
      <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-5 shadow-xs text-[#F0F5EF] space-y-4">
        {/* Storage Status Header */}
        <div className="flex items-center justify-between border-b border-[#1C4D3C]/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#061812] text-[#A6F16A] border border-[#1C4D3C]">
              <Database className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                IndexedDB Local Storage
              </h2>
              <span className="text-xs text-[#7B9586]">On-device persistence</span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-[#133D2F] text-[#A6F16A] border-[#1C4D3C]">
            <CheckCircle2 className="w-3 h-3 text-[#A6F16A]" />
            <span>Active</span>
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#061812] p-3.5 border border-[#1C4D3C]">
            <span className="block text-[10px] font-semibold tracking-wider uppercase text-[#7B9586]">
              Observations
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-[#A6F16A]">
                {isLoading ? '...' : (observationCount ?? 0)}
              </span>
              <span className="text-xs text-[#B2C8BA]">records</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#061812] p-3.5 border border-[#1C4D3C]">
            <span className="block text-[10px] font-semibold tracking-wider uppercase text-[#7B9586]">
              Projects & Surveys
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-[#20D6A0]">
                {isLoading ? '...' : ((projectCount ?? 0) + (surveyCount ?? 0))}
              </span>
              <span className="text-xs text-[#B2C8BA]">entities</span>
            </div>
          </div>
        </div>

        {/* Dataset Export Option */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleExportAll}
            disabled={!observationCount}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#A6F16A] to-[#20D6A0] text-[#061812] font-bold text-sm shadow-sm hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#061812]" />
            <span>Export Darwin Core (DwC) Dataset</span>
          </button>
        </div>
      </div>
    </div>
  )
}
