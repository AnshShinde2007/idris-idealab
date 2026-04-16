"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapMarker {
  id: string
  lat: number
  lng: number
  type: "emergency" | "volunteer" | "ambulance" | "hospital"
  label: string
  severity?: string
}

interface InteractiveMapProps {
  markers: MapMarker[]
  filters: {
    emergencies: boolean
    volunteers: boolean
    ambulances: boolean
    hospitals: boolean
  }
  showHeatmap: boolean
  center?: [number, number]
  zoom?: number
}

export function InteractiveMap({
  markers,
  filters,
  showHeatmap,
  center = [19.076, 72.8777],
  zoom = 12,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const [mapReady, setMapReady] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      attributionControl: true,
    })

    // Add dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map)

    // Create markers layer
    markersLayerRef.current = L.layerGroup().addTo(map)

    mapRef.current = map
    setMapReady(true)

    return () => {
      map.remove()
      mapRef.current = null
      markersLayerRef.current = null
    }
  }, [])

  // Update markers when data or filters change
  useEffect(() => {
    if (!mapReady || !markersLayerRef.current) return

    // Clear existing markers
    markersLayerRef.current.clearLayers()

    // Filter and add markers
    const filteredMarkers = markers.filter((marker) => {
      if (marker.type === "emergency" && !filters.emergencies) return false
      if (marker.type === "volunteer" && !filters.volunteers) return false
      if (marker.type === "ambulance" && !filters.ambulances) return false
      if (marker.type === "hospital" && !filters.hospitals) return false
      return true
    })

    filteredMarkers.forEach((marker) => {
      const icon = createCustomIcon(marker.type, marker.severity)
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
        .bindPopup(createPopupContent(marker))
      markersLayerRef.current?.addLayer(leafletMarker)
    })
  }, [markers, filters, mapReady])

  // Handle heatmap overlay
  useEffect(() => {
    if (!mapRef.current) return

    if (showHeatmap) {
      // Add a semi-transparent overlay to simulate heatmap effect
      const emergencyMarkers = markers.filter(m => m.type === "emergency")
      emergencyMarkers.forEach(marker => {
        const circle = L.circle([marker.lat, marker.lng], {
          color: marker.severity === "critical" ? "#ef4444" : marker.severity === "moderate" ? "#f59e0b" : "#22c55e",
          fillColor: marker.severity === "critical" ? "#ef4444" : marker.severity === "moderate" ? "#f59e0b" : "#22c55e",
          fillOpacity: 0.2,
          radius: 500,
          className: "heatmap-circle"
        })
        markersLayerRef.current?.addLayer(circle)
      })
    }
  }, [showHeatmap, markers])

  return (
    <div ref={mapContainerRef} className="h-full w-full" />
  )
}

function createCustomIcon(type: string, severity?: string): L.DivIcon {
  const colors: Record<string, string> = {
    emergency: severity === "critical" ? "#ef4444" : severity === "moderate" ? "#f59e0b" : "#22c55e",
    volunteer: "#22c55e",
    ambulance: "#3b82f6",
    hospital: "#ffffff",
  }

  const sizes: Record<string, number> = {
    emergency: 20,
    volunteer: 14,
    ambulance: 16,
    hospital: 18,
  }

  const color = colors[type] || "#ffffff"
  const size = sizes[type] || 16

  const iconHtml = type === "emergency" 
    ? `<div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid rgba(0,0,0,0.3);
        border-radius: 50%;
        box-shadow: 0 0 10px ${color}, 0 0 20px ${color}40;
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 10px ${color}, 0 0 20px ${color}40; }
          50% { box-shadow: 0 0 20px ${color}, 0 0 40px ${color}60; }
          100% { box-shadow: 0 0 10px ${color}, 0 0 20px ${color}40; }
        }
      </style>`
    : `<div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 2px solid rgba(0,0,0,0.3);
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>`

  return L.divIcon({
    html: iconHtml,
    className: "custom-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function createPopupContent(marker: MapMarker): string {
  const typeLabels: Record<string, string> = {
    emergency: "Emergency",
    volunteer: "Volunteer",
    ambulance: "Ambulance",
    hospital: "Hospital",
  }

  const typeColors: Record<string, string> = {
    emergency: "#ef4444",
    volunteer: "#22c55e",
    ambulance: "#3b82f6",
    hospital: "#ffffff",
  }

  return `
    <div style="
      padding: 8px;
      min-width: 150px;
      background: #1a1a1a;
      color: white;
      border-radius: 8px;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      ">
        <div style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${typeColors[marker.type]};
        "></div>
        <strong style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
          ${typeLabels[marker.type]}
        </strong>
      </div>
      <p style="margin: 0; font-size: 14px; font-weight: 500;">${marker.label}</p>
      ${marker.severity ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #888; text-transform: capitalize;">Severity: ${marker.severity}</p>` : ""}
    </div>
  `
}
