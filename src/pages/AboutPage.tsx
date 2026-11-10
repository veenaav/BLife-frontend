import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface AboutPageProps {
  onBack?: () => void
}

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 space-y-5 text-[#F0F5EF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C4D3C]/70 pb-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-[28px] font-bold tracking-wide text-white">
            About BLife
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

      {/* Streamlined Placeholder Content */}
      <div className="rounded-2xl border border-[#1C4D3C] bg-[#0D2D22] p-5 shadow-xs">
        <p className="text-sm text-[#B2C8BA] leading-relaxed">
          About BLife platform information and documentation will be updated here.
        </p>
      </div>
    </div>
  )
}
