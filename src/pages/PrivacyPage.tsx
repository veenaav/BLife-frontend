import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Camera,
  Database,
  EyeOff,
  Share2,
  Trash2,
} from 'lucide-react'

interface PrivacyPageProps {
  onBack?: () => void
}

const PRIVACY_HEADINGS = [
  { title: 'Local-First Data Privacy', icon: ShieldCheck, iconColor: 'text-[#A6F16A]' },
  { title: 'GPS Coordinates & Location Data', icon: MapPin, iconColor: 'text-[#20D6A0]' },
  { title: 'Photographs & Media', icon: Camera, iconColor: 'text-[#A6F16A]' },
  { title: 'Local Device Storage', icon: Database, iconColor: 'text-[#20D6A0]' },
  { title: 'Zero Commercial Tracking', icon: EyeOff, iconColor: 'text-[#A6F16A]' },
  { title: 'Institutional Data Sharing Policy', icon: Share2, iconColor: 'text-[#20D6A0]' },
  { title: 'Record Deletion & Control', icon: Trash2, iconColor: 'text-rose-400' },
]

export default function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-[#F0F5EF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C4D3C]/70 pb-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-[28px] font-bold tracking-wide text-white">
            Privacy & Data Sharing
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

      {/* Clean Light Summary List of Headings */}
      <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] divide-y divide-[#1C4D3C]/60 shadow-xs overflow-hidden">
        {PRIVACY_HEADINGS.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="flex items-center gap-3.5 px-4 py-3 sm:py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#133D2F]/50"
            >
              <div
                className={`flex h-8 w-8 sm:h-8.5 sm:w-8.5 shrink-0 items-center justify-center rounded-xl bg-[#061812] border border-[#1C4D3C] ${item.iconColor}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="truncate">{item.title}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
