import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin,
  Maximize2,
  AlertCircle,
  List,
} from 'lucide-react'
import type { Observation, IdentificationStatus } from '@/db/database'
import type { ObservationFilterStatus } from './useObservations'

// Default center coordinates (Thiruvananthapuram, Kerala fallback)
const DEFAULT_LATITUDE = Number(import.meta.env.VITE_DEFAULT_LATITUDE) || 8.5241
const DEFAULT_LONGITUDE = Number(import.meta.env.VITE_DEFAULT_LONGITUDE) || 76.9366
const DEFAULT_CENTER: [number, number] = [DEFAULT_LATITUDE, DEFAULT_LONGITUDE]
const DEFAULT_ZOOM = Number(import.meta.env.VITE_DEFAULT_ZOOM) || 13

export interface ObservationsMapViewProps {
  observations: Observation[]
  selectedFilter: ObservationFilterStatus
  onSelectFilter: (filter: ObservationFilterStatus) => void
  onSwitchToList?: () => void
}

interface GeolocatedItem {
  observation: Observation
  lat: number
  lng: number
}

interface CoordinateGroup {
  lat: number
  lng: number
  items: GeolocatedItem[]
}

// Distinct category colors for pins and radio buttons
const CATEGORY_COLORS: Record<
  IdentificationStatus,
  { stroke: string; body: string; center: string; radioDot: string }
> = {
  Identified: {
    stroke: '#20D6A0',
    body: '#0D2D22',
    center: '#A6F16A',
    radioDot: '#20D6A0',
  },
  'Needs verification': {
    stroke: '#F59E0B',
    body: '#291A08',
    center: '#FCD34D',
    radioDot: '#F59E0B',
  },
  Unknown: {
    stroke: '#94A3B8',
    body: '#18231E',
    center: '#CBD5E1',
    radioDot: '#94A3B8',
  },
}

const FILTER_OPTIONS: {
  value: ObservationFilterStatus
  label: string
  color: string
}[] = [
  { value: 'All', label: 'All', color: '#A6F16A' },
  { value: 'Identified', label: 'Identified', color: '#20D6A0' },
  { value: 'Needs verification', label: 'Needs Verification', color: '#F59E0B' },
  { value: 'Unknown', label: 'Unknown', color: '#94A3B8' },
]

/**
 * Validate that an observation contains valid geographic coordinates.
 */
function getValidCoordinates(obs: Observation): [number, number] | null {
  const lat =
    typeof obs.latitude === 'number' && !Number.isNaN(obs.latitude)
      ? obs.latitude
      : typeof obs.gps_latitude === 'number' && !Number.isNaN(obs.gps_latitude)
      ? obs.gps_latitude
      : null

  const lng =
    typeof obs.longitude === 'number' && !Number.isNaN(obs.longitude)
      ? obs.longitude
      : typeof obs.gps_longitude === 'number' && !Number.isNaN(obs.gps_longitude)
      ? obs.gps_longitude
      : null

  if (lat === null || lng === null) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  // Exclude Null Island (0,0) indicating unset GPS
  if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) return null

  return [lat, lng]
}

/**
 * Escape HTML to prevent injection inside Leaflet popups
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Format observation timestamp for compact display
 */
function getFormattedDate(obs: Observation): string {
  const timestamp = obs.observationAt || obs.recordedAt || obs.createdAt
  if (!timestamp) return 'Date not recorded'
  try {
    const d = new Date(timestamp)
    if (isNaN(d.getTime())) return 'Date not recorded'
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return 'Date not recorded'
  }
}

/**
 * Render compact status pill in popup
 */
function getStatusBadgeHtml(status?: IdentificationStatus): string {
  if (!status) return ''
  let bg = '#133D2F'
  let color = '#A6F16A'
  let border = '#1C4D3C'

  if (status === 'Unknown') {
    bg = '#1C2C24'
    color = '#B2C8BA'
    border = '#1C4D3C'
  } else if (status === 'Needs verification') {
    bg = 'rgba(120, 53, 15, 0.75)'
    color = '#FCD34D'
    border = 'rgba(180, 83, 9, 0.75)'
  }

  return `<span style="display:inline-flex;align-items:center;gap:3px;border-radius:9999px;border:1px solid ${border};background:${bg};color:${color};padding:1px 6px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">
    <span style="width:4px;height:4px;border-radius:50%;background:currentColor;"></span>
    <span>${escapeHtml(status)}</span>
  </span>`
}

/**
 * HTML generator for single observation popup
 */
function renderSingleObservationPopup(obs: Observation, photoUrl?: string): string {
  const commonName = escapeHtml(
    obs.speciesName?.trim() ||
      (obs.identificationStatus === 'Unknown' ? 'Unknown species' : 'Unnamed observation')
  )
  const scientificName = obs.scientificName?.trim() ? escapeHtml(obs.scientificName.trim()) : null
  const dateStr = getFormattedDate(obs)
  const statusBadge = getStatusBadgeHtml(obs.identificationStatus)
  const id = obs.id || ''

  const photoHtml = photoUrl
    ? `<div style="position:relative;width:100%;height:120px;overflow:hidden;background:#061812;border-bottom:1px solid #1C4D3C;">
         <img src="${photoUrl}" alt="${commonName}" style="width:100%;height:100%;object-fit:cover;display:block;" />
       </div>`
    : `<div style="width:100%;height:85px;background:#061812;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#7B9586;border-bottom:1px solid #1C4D3C;">
         <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2A5C4B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
         <span style="font-size:10px;margin-top:4px;color:#7B9586;font-weight:500;">No photograph</span>
       </div>`

  return `
    <div class="blife-popup-card" style="font-family:inherit;width:240px;color:#F0F5EF;">
      ${photoHtml}
      <div style="padding:10px 12px;background:#0D2D22;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;">
          ${statusBadge}
          <span style="font-size:10px;color:#B2C8BA;white-space:nowrap;">${dateStr}</span>
        </div>
        <div style="font-size:13px;font-weight:700;color:#FFFFFF;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${commonName}">
          ${commonName}
        </div>
        ${
          scientificName
            ? `<div style="font-size:11px;font-style:italic;color:#20D6A0;line-height:1.2;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${scientificName}</div>`
            : ''
        }
        <button
          type="button"
          data-observation-id="${id}"
          class="blife-popup-btn"
          style="margin-top:10px;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:7px 10px;border-radius:10px;background:#133D2F;color:#A6F16A;border:1px solid #1C4D3C;font-size:11px;font-weight:700;cursor:pointer;"
        >
          <span>View Record Details</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  `
}

/**
 * HTML generator for multi-observation popup (when multiple sightings share identical GPS coordinates)
 */
function renderClusterObservationPopup(
  observations: Observation[],
  photoUrls: Record<string, string>
): string {
  const count = observations.length
  const itemsHtml = observations
    .map((obs) => {
      const commonName = escapeHtml(
        obs.speciesName?.trim() ||
          (obs.identificationStatus === 'Unknown' ? 'Unknown species' : 'Unnamed observation')
      )
      const scientificName = obs.scientificName?.trim()
        ? escapeHtml(obs.scientificName.trim())
        : null
      const dateStr = getFormattedDate(obs)
      const photoUrl = obs.id ? photoUrls[obs.id] : undefined
      const id = obs.id || ''

      const thumbHtml = photoUrl
        ? `<img src="${photoUrl}" alt="${commonName}" style="width:36px;height:36px;object-fit:cover;border-radius:8px;border:1px solid #1C4D3C;shrink:0;" />`
        : `<div style="width:36px;height:36px;background:#061812;border-radius:8px;border:1px solid #1C4D3C;display:flex;align-items:center;justify-content:center;color:#7B9586;shrink:0;">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B9586" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
           </div>`

      return `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(28, 77, 60, 0.4);">
          ${thumbHtml}
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;font-weight:700;color:#FFFFFF;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${commonName}
            </div>
            ${
              scientificName
                ? `<div style="font-size:10px;font-style:italic;color:#20D6A0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${scientificName}</div>`
                : ''
            }
            <div style="font-size:9px;color:#B2C8BA;margin-top:1px;">${dateStr}</div>
          </div>
          <button
            type="button"
            data-observation-id="${id}"
            class="blife-popup-btn"
            style="padding:5px 8px;border-radius:8px;background:#133D2F;color:#A6F16A;border:1px solid #1C4D3C;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;"
          >
            View
          </button>
        </div>
      `
    })
    .join('')

  return `
    <div class="blife-popup-card" style="font-family:inherit;width:260px;color:#F0F5EF;padding:10px 12px;background:#0D2D22;">
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1C4D3C;padding-bottom:6px;margin-bottom:6px;">
        <span style="font-size:12px;font-weight:800;color:#A6F16A;">${count} Observations</span>
        <span style="font-size:10px;color:#B2C8BA;">At this spot</span>
      </div>
      <div style="max-height:220px;overflow-y:auto;padding-right:4px;" class="dropdown-scrollbar">
        ${itemsHtml}
      </div>
    </div>
  `
}

/**
 * Custom color-coded location-pin SVG icon for each observation category.
 * Replaces cluster number bubbles entirely.
 */
function createCategoryPinIcon(status: IdentificationStatus = 'Identified'): L.DivIcon {
  const cfg = CATEGORY_COLORS[status] || CATEGORY_COLORS.Identified
  return L.divIcon({
    className: 'blife-custom-pin-icon',
    html: `
      <div class="blife-pin-svg-wrapper" style="width:28px;height:34px;cursor:pointer;">
        <svg width="28" height="34" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.65));">
          <path d="M12 1C6.477 1 2 5.477 2 11c0 7.8 10 18 10 18s10-10.2 10-18c0-5.523-4.477-10-10-10z" fill="${cfg.body}" stroke="${cfg.stroke}" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="12" cy="11" r="3.8" fill="${cfg.center}"/>
        </svg>
      </div>
    `,
    iconSize: [28, 34],
    iconAnchor: [14, 33],
    popupAnchor: [0, -32],
  })
}

export default function ObservationsMapView({
  observations,
  selectedFilter,
  onSelectFilter,
  onSwitchToList,
}: ObservationsMapViewProps) {
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  const [isMapReady, setIsMapReady] = useState(false)

  // 1. Calculate record count for each category across all observations
  const categoryCounts = useMemo(() => {
    return {
      All: observations.length,
      Identified: observations.filter((o) => o.identificationStatus === 'Identified').length,
      'Needs verification': observations.filter(
        (o) => o.identificationStatus === 'Needs verification'
      ).length,
      Unknown: observations.filter((o) => o.identificationStatus === 'Unknown').length,
    }
  }, [observations])

  // 2. Filter observations matching current category selection
  const displayedObservations = useMemo(() => {
    if (selectedFilter === 'All') return observations
    return observations.filter((obs) => obs.identificationStatus === selectedFilter)
  }, [observations, selectedFilter])

  // 3. Extract observations with valid GPS coordinates
  const geolocatedItems = useMemo<GeolocatedItem[]>(() => {
    return displayedObservations
      .map((obs) => {
        const coords = getValidCoordinates(obs)
        if (!coords) return null
        return {
          observation: obs,
          lat: coords[0],
          lng: coords[1],
        }
      })
      .filter((item): item is GeolocatedItem => item !== null)
  }, [displayedObservations])

  const initialItemsRef = useRef(geolocatedItems)
  const unmappedCount = displayedObservations.length - geolocatedItems.length

  // 4. Resolve photograph blobs into object URLs with lifecycle cleanup
  useEffect(() => {
    const newUrls: Record<string, string> = {}
    const createdBlobUrls: string[] = []

    for (const item of geolocatedItems) {
      const obs = item.observation
      if (!obs.id) continue

      const raw: unknown = obs.photos?.length ? obs.photos[0] : obs.photo
      if (raw instanceof Blob) {
        const url = URL.createObjectURL(raw)
        createdBlobUrls.push(url)
        newUrls[obs.id] = url
      } else if (typeof raw === 'string' && raw.trim()) {
        newUrls[obs.id] = raw.trim()
      }
    }

    setPhotoUrls(newUrls)

    return () => {
      createdBlobUrls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [geolocatedItems])

  // 5. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Calculate initial map center using ref
    let initialCenter: [number, number] = DEFAULT_CENTER
    let initialZoom = DEFAULT_ZOOM

    const initialItems = initialItemsRef.current
    if (initialItems.length === 1) {
      initialCenter = [initialItems[0].lat, initialItems[0].lng]
      initialZoom = 15
    } else if (initialItems.length > 1) {
      initialCenter = [initialItems[0].lat, initialItems[0].lng]
    }

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false, // Moved to bottom-right to avoid overlapping top chip bar
      scrollWheelZoom: true,
      attributionControl: false,
    })

    // Add zoom controls to bottom-right corner
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Add attribution to bottom-left corner
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map)

    // Map tiles: Mapbox Outdoors if token exists, fallback to standard OpenStreetMap
    const mapboxToken =
      (import.meta.env.VITE_MAPBOX_TOKEN as string) ||
      (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string) ||
      ''

    const tileLayer = mapboxToken
      ? L.tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${mapboxToken}`,
          {
            maxZoom: 22,
            tileSize: 512,
            zoomOffset: -1,
            attribution:
              '© <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener noreferrer">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
          }
        )
      : L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
        })

    tileLayer.addTo(map)

    const markersGroup = L.layerGroup().addTo(map)
    markersLayerRef.current = markersGroup
    mapRef.current = map

    // Handle interactive popup navigation links without full page reload
    map.on('popupopen', (e) => {
      const container = e.popup.getElement()
      if (!container) return
      const buttons = container.querySelectorAll<HTMLElement>('[data-observation-id]')
      buttons.forEach((btn) => {
        btn.onclick = (evt) => {
          evt.preventDefault()
          evt.stopPropagation()
          const obsId = btn.getAttribute('data-observation-id')
          if (obsId) {
            navigateRef.current(`/observations/${obsId}`)
          }
        }
      })
    })

    // Invalidate size to ensure clean tile rendering after layout paint
    const timer = setTimeout(() => {
      map.invalidateSize()
      setIsMapReady(true)
    }, 200)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapRef.current = null
      markersLayerRef.current = null
    }
  }, []) // Mount once

  // 6. Render Custom Colored Location Icons for Each Observation
  const renderMarkers = useCallback(() => {
    const map = mapRef.current
    const markersGroup = markersLayerRef.current
    if (!map || !markersGroup) return

    markersGroup.clearLayers()

    if (geolocatedItems.length === 0) return

    // Group observations by coordinate (to cleanly handle identical GPS coordinates)
    const coordGroups: CoordinateGroup[] = []
    for (const item of geolocatedItems) {
      const existing = coordGroups.find(
        (g) =>
          Math.abs(g.lat - item.lat) < 0.00005 &&
          Math.abs(g.lng - item.lng) < 0.00005
      )
      if (existing) {
        existing.items.push(item)
      } else {
        coordGroups.push({
          lat: item.lat,
          lng: item.lng,
          items: [item],
        })
      }
    }

    for (const group of coordGroups) {
      if (group.items.length === 1) {
        // Individual observation marker
        const item = group.items[0]
        const obs = item.observation
        const status = obs.identificationStatus || 'Identified'
        const marker = L.marker([item.lat, item.lng], {
          icon: createCategoryPinIcon(status),
        })

        const popupContent = renderSingleObservationPopup(
          obs,
          obs.id ? photoUrls[obs.id] : undefined
        )

        marker.bindPopup(popupContent, {
          className: 'blife-map-popup',
          maxWidth: 260,
          minWidth: 220,
          closeButton: true,
          autoPan: true,
          autoPanPadding: [20, 20],
        })

        markersGroup.addLayer(marker)
      } else {
        // Multiple observations at the exact same location
        const firstObs = group.items[0].observation
        const status = firstObs.identificationStatus || 'Identified'
        const marker = L.marker([group.lat, group.lng], {
          icon: createCategoryPinIcon(status),
        })

        const popupContent = renderClusterObservationPopup(
          group.items.map((i) => i.observation),
          photoUrls
        )

        marker.bindPopup(popupContent, {
          className: 'blife-map-popup',
          maxWidth: 280,
          minWidth: 240,
          closeButton: true,
          autoPan: true,
          autoPanPadding: [20, 20],
        })

        markersGroup.addLayer(marker)
      }
    }
  }, [geolocatedItems, photoUrls])

  // Re-render markers whenever geolocatedItems or photoUrls update
  useEffect(() => {
    renderMarkers()
  }, [renderMarkers])

  // 7. Fit bounds when geolocated items change or initial mount
  const handleFitAll = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    if (geolocatedItems.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
    } else if (geolocatedItems.length === 1) {
      map.setView([geolocatedItems[0].lat, geolocatedItems[0].lng], 15, { animate: true })
    } else {
      const bounds = L.latLngBounds(geolocatedItems.map((i) => [i.lat, i.lng]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true })
    }
  }, [geolocatedItems])

  // Auto-fit on initial map load or when filtered geolocatedItems list changes
  useEffect(() => {
    if (!isMapReady) return
    handleFitAll()
  }, [isMapReady, handleFitAll])

  return (
    <div className="relative w-full h-full flex-1 min-h-0 rounded-2xl border border-[#1C4D3C] overflow-hidden bg-[#061812] shadow-2xl isolate z-0 flex flex-col">
      <div ref={mapContainerRef} className="w-full h-full flex-1 min-h-0 z-0" />

      {/* Sleek Horizontal Filter Chip/Pill Bar (Top of Map Area to save vertical space) */}
      <div
        role="radiogroup"
        aria-label="Filter observations by status"
        className="absolute top-2.5 left-2.5 z-30 inline-flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-[#061812]/92 backdrop-blur-md border border-[#1C4D3C] shadow-xl max-w-[calc(100%-4.25rem)] overflow-x-auto no-scrollbar"
      >
        {FILTER_OPTIONS.map((opt) => {
          const isSelected = selectedFilter === opt.value
          const count = categoryCounts[opt.value]
          const isDisabled = count === 0 && opt.value !== 'All'

          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) {
                  onSelectFilter(opt.value)
                }
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold transition-all select-none whitespace-nowrap ${
                isDisabled
                  ? 'opacity-40 cursor-not-allowed text-[#7B9586] border border-transparent'
                  : isSelected
                  ? 'bg-[#133D2F] text-white shadow-sm border border-[#1C4D3C] cursor-pointer active:scale-95'
                  : 'text-[#B2C8BA] hover:text-white hover:bg-[#0D2D22]/80 cursor-pointer active:scale-95 border border-transparent'
              }`}
            >
              {/* Radio circle indicator */}
              <span
                className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  isDisabled
                    ? 'border-[#2A4A3C] bg-transparent'
                    : isSelected
                    ? 'border-[#A6F16A] bg-[#061812]'
                    : 'border-[#1C4D3C] bg-transparent'
                }`}
              >
                {isSelected && !isDisabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A6F16A]" />
                )}
              </span>

              {/* Color dot matching category map pin */}
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: opt.color }}
              />

              {/* Label */}
              <span className="truncate">{opt.label}</span>
            </button>
          )
        })}
      </div>

      {/* Floating Controls: Fit All Button (Positioned at top-right, aligned with horizontal chip bar) */}
      {geolocatedItems.length > 0 && (
        <div className="absolute top-2.5 right-2.5 z-20">
          <button
            type="button"
            onClick={handleFitAll}
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 rounded-xl bg-[#0D2D22]/90 hover:bg-[#133D2F] border border-[#1C4D3C] text-xs font-semibold text-[#A6F16A] shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer h-[32px]"
            title="Fit map to all observations"
            aria-label="Fit map to all observations"
          >
            <Maximize2 className="h-3.5 w-3.5 text-[#20D6A0]" />
            <span className="hidden sm:inline">Fit All</span>
          </button>
        </div>
      )}

      {/* Zero Records Overlay — backdrop has pointer-events-none so horizontal chip bar at z-30 remains 100% interactive */}
      {geolocatedItems.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-4">
          <div className="pointer-events-auto max-w-xs w-full rounded-2xl bg-[#061812]/92 border border-[#1C4D3C] p-5 text-center shadow-2xl backdrop-blur-md">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0D2D22] border border-[#1C4D3C] text-[#20D6A0] shadow-md">
              <MapPin className="h-5 w-5 stroke-[1.8]" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-white">
              No Records Found
            </h3>
            <p className="mt-1 text-xs text-[#B2C8BA]">
              {displayedObservations.length > 0
                ? `No ${selectedFilter === 'All' ? '' : `"${selectedFilter}" `}observations with GPS coordinates.`
                : 'No observations recorded yet.'}
            </p>
            {onSwitchToList && displayedObservations.length > 0 && (
              <button
                type="button"
                onClick={onSwitchToList}
                className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-[#133D2F] hover:bg-[#1C4D3C] border border-[#1C4D3C] text-[#A6F16A] px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
              >
                <List className="h-3.5 w-3.5" />
                <span>View in List</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Unmapped Observations Indicator (Positioned at bottom-left) */}
      {unmappedCount > 0 && geolocatedItems.length > 0 && (
        <div className="absolute bottom-2.5 left-20 z-10 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#061812]/90 backdrop-blur-md border border-[#1C4D3C] text-[10px] text-[#B2C8BA] shadow-md pointer-events-auto">
          <AlertCircle className="h-3 w-3 text-amber-400 shrink-0" />
          <span>{unmappedCount} without GPS</span>
          {onSwitchToList && (
            <button
              type="button"
              onClick={onSwitchToList}
              className="font-bold text-[#A6F16A] hover:underline cursor-pointer ml-1"
            >
              View in List
            </button>
          )}
        </div>
      )}
    </div>
  )
}
