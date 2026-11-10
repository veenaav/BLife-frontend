import { useState } from 'react'
import { Leaf, X, List, Map as MapIcon } from 'lucide-react'
import ObservationCard from '@/components/ObservationCard'
import {
  useObservations,
  ObservationsMapView,
  type ObservationFilterStatus,
} from '@/features/observations'

export default function ObservationsPage() {
  const {
    observations,
    filteredObservations,
    availableTags,
    selectedFilter,
    setSelectedFilter,
    selectedTag,
    setSelectedTag,
    isLoading,
    handleDeleteObservation,
  } = useObservations()

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  return (
    <div className="h-full max-h-full w-full max-w-lg md:max-w-6xl mx-auto flex flex-col overflow-hidden px-2.5 sm:px-4 md:px-6 pt-2 pb-1 text-[#F0F5EF]">
      {/* Streamlined Minimalist Header (Strict single line, no wrapping) */}
      <div className="shrink-0 flex items-center justify-between gap-2.5 border-b border-[#1C4D3C] pb-2 pt-0.5">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0">
            My Records
          </h1>
          {/* Minimalist observation count badge */}
          <span
            className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#133D2F] border border-[#1C4D3C] text-xs font-bold text-[#A6F16A] shadow-sm shrink-0"
            title="Total recorded observations"
          >
            {observations.length}
          </span>
        </div>

        {/* View Toggle */}
        <div
          role="tablist"
          aria-label="View Selection"
          className="inline-flex items-center p-0.5 rounded-2xl bg-[#061812] border border-[#1C4D3C] shadow-inner shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#133D2F] text-[#A6F16A] shadow-md border border-[#1C4D3C]'
                : 'text-[#B2C8BA] hover:text-white hover:bg-[#0D2D22]'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">List View</span>
            <span className="inline xs:hidden">List</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'map'}
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-[#133D2F] text-[#A6F16A] shadow-md border border-[#1C4D3C]'
                : 'text-[#B2C8BA] hover:text-white hover:bg-[#0D2D22]'
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Map View</span>
            <span className="inline xs:hidden">Map</span>
          </button>
        </div>
      </div>

      {/* Filter Pills — Displayed only in List View (In Map View they float neatly on the map) */}
      {viewMode === 'list' && observations.length > 0 && (
        <div className="shrink-0 space-y-1.5 py-2">
          {/* Status filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar text-xs">
            {(['All', 'Identified', 'Needs verification', 'Unknown'] as const).map((filter) => {
              const count =
                filter === 'All'
                  ? observations.length
                  : observations.filter((o) => o.identificationStatus === filter).length
              const isDisabled = count === 0 && filter !== 'All'

              return (
                <button
                  key={filter}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      setSelectedFilter(filter as ObservationFilterStatus)
                    }
                  }}
                  className={`rounded-full px-3 py-1 font-semibold tracking-wider uppercase transition-all whitespace-nowrap text-xs ${
                    isDisabled
                      ? 'opacity-40 cursor-not-allowed bg-[#0D2D22] text-[#7B9586] border border-[#1C4D3C]'
                      : selectedFilter === filter
                      ? 'bg-[#A6F16A] text-[#061812] shadow-md shadow-[#A6F16A]/20 cursor-pointer active:scale-95'
                      : 'bg-[#0D2D22] text-[#B2C8BA] border border-[#1C4D3C] hover:border-[#A6F16A]/40 cursor-pointer active:scale-95'
                  }`}
                >
                  {filter === 'All' ? `All (${observations.length})` : filter}
                </button>
              )
            })}
          </div>

          {/* Active tag filter indicator if a tag is selected */}
          {selectedTag && (
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs text-[#7B9586]">Filtered by tag:</span>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#133D2F] border border-[#1C4D3C] px-2.5 py-1 text-xs font-semibold text-[#A6F16A] hover:bg-rose-950/60 hover:border-rose-800 hover:text-rose-300 transition-colors cursor-pointer"
                title="Click to clear filter"
              >
                <span>#{availableTags.find((t) => t.id === selectedTag)?.name || selectedTag}</span>
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area: Map View vs List View */}
      <div className="flex-1 min-h-0 flex flex-col pt-2 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-[#7B9586]">
            <p>Loading observations...</p>
          </div>
        ) : viewMode === 'map' ? (
          <ObservationsMapView
            observations={observations}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            onSwitchToList={() => setViewMode('list')}
          />
        ) : filteredObservations.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#1C4D3C] bg-[#0D2D22] p-8 text-center shadow-xl shadow-[#061812]/50 my-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#133D2F] border border-[#1C4D3C] text-[#A6F16A]">
              <Leaf className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">
              {observations.length === 0 ? 'No observations recorded yet' : `No "${selectedFilter}" observations`}
            </h2>
            <p className="mt-1.5 text-xs text-[#B2C8BA] max-w-xs mx-auto">
              {observations.length === 0
                ? 'Species observations recorded in the field will appear here.'
                : 'Try selecting a different filter above.'}
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto dropdown-scrollbar pr-1 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 pb-2">
            {filteredObservations.map((obs) => (
              <ObservationCard
                key={obs.id}
                observation={obs}
                onDelete={handleDeleteObservation}
                onSelectTag={setSelectedTag}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
