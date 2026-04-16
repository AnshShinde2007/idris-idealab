"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  AlertTriangle, 
  Ambulance, 
  Users, 
  Building2, 
  Filter,
  Clock,
  ChevronRight,
  RefreshCw,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

// Dynamically import the map component to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(
  () => import("./interactive-map").then(mod => mod.InteractiveMap),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-secondary">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 text-muted-foreground animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }
)

interface Emergency {
  id: string
  severity: string
  description: string | null
  address: string | null
  status: string
  latitude: number
  longitude: number
  created_at: string
}

interface Volunteer {
  id: string
  full_name: string
  is_available: boolean
  skills: string[]
  latitude: number | null
  longitude: number | null
}

interface Hospital {
  id: string
  name: string
  latitude: number
  longitude: number
  icu_beds_available: number
  er_beds_available: number
}

interface AmbulanceData {
  id: string
  vehicle_number: string
  status: string
  latitude: number | null
  longitude: number | null
  hospitals: { name: string } | null
}

export function LiveMapDashboard() {
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [filters, setFilters] = useState({
    emergencies: true,
    volunteers: true,
    ambulances: true,
    hospitals: true,
  })
  const [emergencies, setEmergencies] = useState<Emergency[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [ambulances, setAmbulances] = useState<AmbulanceData[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    
    const [emergenciesRes, volunteersRes, hospitalsRes, ambulancesRes] = await Promise.all([
      supabase
        .from("emergencies")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("volunteers")
        .select("*")
        .eq("is_available", true)
        .limit(20),
      supabase
        .from("hospitals")
        .select("id, name, latitude, longitude, icu_beds_available, er_beds_available"),
      supabase
        .from("ambulances")
        .select("id, vehicle_number, status, latitude, longitude, hospitals(name)")
    ])

    if (emergenciesRes.data) setEmergencies(emergenciesRes.data)
    if (volunteersRes.data) setVolunteers(volunteersRes.data)
    if (hospitalsRes.data) setHospitals(hospitalsRes.data)
    if (ambulancesRes.data) setAmbulances(ambulancesRes.data as AmbulanceData[])
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel("map-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "emergencies" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ambulances" },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Convert data to map markers
  const mapMarkers = useMemo(() => {
    const markers: Array<{
      id: string
      lat: number
      lng: number
      type: "emergency" | "volunteer" | "ambulance" | "hospital"
      label: string
      severity?: string
    }> = []

    // Add emergency markers
    emergencies.forEach((e) => {
      if (e.latitude && e.longitude) {
        markers.push({
          id: e.id,
          lat: e.latitude,
          lng: e.longitude,
          type: "emergency",
          label: e.address || "Emergency Location",
          severity: e.severity,
        })
      }
    })

    // Add volunteer markers
    volunteers.forEach((v) => {
      if (v.latitude && v.longitude) {
        markers.push({
          id: v.id,
          lat: v.latitude,
          lng: v.longitude,
          type: "volunteer",
          label: v.full_name,
        })
      }
    })

    // Add ambulance markers
    ambulances.forEach((a) => {
      if (a.latitude && a.longitude) {
        markers.push({
          id: a.id,
          lat: a.latitude,
          lng: a.longitude,
          type: "ambulance",
          label: `${a.vehicle_number} (${a.status})`,
        })
      }
    })

    // Add hospital markers
    hospitals.forEach((h) => {
      markers.push({
        id: h.id,
        lat: h.latitude,
        lng: h.longitude,
        type: "hospital",
        label: h.name,
      })
    })

    return markers
  }, [emergencies, volunteers, ambulances, hospitals])

  const availableAmbulances = ambulances.filter(a => a.status === "available").length
  const hospitalsWithBeds = hospitals.filter(h => h.icu_beds_available > 0 || h.er_beds_available > 0).length

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / 60000)
    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes} min ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full border-b border-border lg:w-80 lg:border-b-0 lg:border-r overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-1">
            <StatCard
              icon={AlertTriangle}
              label="Active Emergencies"
              value={String(emergencies.length)}
              color="emergency"
            />
            <StatCard
              icon={Users}
              label="Volunteers Online"
              value={String(volunteers.length)}
              color="success"
            />
            <StatCard
              icon={Ambulance}
              label="Available Ambulances"
              value={String(availableAmbulances)}
              color="primary"
            />
            <StatCard
              icon={Building2}
              label="Hospitals with Beds"
              value={String(hospitalsWithBeds)}
              color="primary"
            />
          </div>

          {/* Filters */}
          <Card className="mb-6 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Map Layers
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={fetchData}
                  disabled={loading}
                >
                  <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FilterToggle
                label="Emergencies"
                checked={filters.emergencies}
                onChange={(checked) => setFilters({ ...filters, emergencies: checked })}
                color="emergency"
              />
              <FilterToggle
                label="Volunteers"
                checked={filters.volunteers}
                onChange={(checked) => setFilters({ ...filters, volunteers: checked })}
                color="success"
              />
              <FilterToggle
                label="Ambulances"
                checked={filters.ambulances}
                onChange={(checked) => setFilters({ ...filters, ambulances: checked })}
                color="primary"
              />
              <FilterToggle
                label="Hospitals"
                checked={filters.hospitals}
                onChange={(checked) => setFilters({ ...filters, hospitals: checked })}
                color="primary"
              />
              <div className="border-t border-border pt-3">
                <FilterToggle
                  label="Crisis Heatmap"
                  checked={showHeatmap}
                  onChange={setShowHeatmap}
                  color="warning"
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Emergencies List */}
          <div>
            <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">
              Recent Emergencies
              <Badge variant="secondary" className="bg-emergency/10 text-emergency">
                {emergencies.length} Active
              </Badge>
            </h3>
            <div className="space-y-2">
              {emergencies.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="p-4 text-center text-sm text-muted-foreground">
                    No active emergencies
                  </CardContent>
                </Card>
              ) : (
                emergencies.map((emergency) => (
                  <Card key={emergency.id} className="border-border cursor-pointer hover:bg-secondary/50 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "mt-0.5 h-2 w-2 rounded-full",
                          emergency.severity === "critical" ? "bg-emergency" : 
                          emergency.severity === "moderate" ? "bg-warning" : "bg-success"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium capitalize">{emergency.severity} Emergency</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {emergency.address || "Location pending..."}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(emergency.created_at)}
                          </p>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            emergency.severity === "critical" 
                              ? "bg-emergency/10 text-emergency" 
                              : emergency.severity === "moderate"
                              ? "bg-warning/10 text-warning"
                              : "bg-success/10 text-success"
                          )}
                        >
                          {emergency.severity}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Map Area */}
      <div className="relative flex-1 min-h-[400px]">
        <InteractiveMap
          markers={mapMarkers}
          filters={filters}
          showHeatmap={showHeatmap}
          center={[40.7128, -74.006]}
          zoom={12}
        />

        {/* Quick info panel */}
        <div className="absolute bottom-4 left-4 right-4 lg:left-auto lg:max-w-md z-[1000]">
          <Card className="border-border bg-background/95 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Nearby Responders</h4>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View All <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              {volunteers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No volunteers available nearby</p>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {volunteers.slice(0, 4).map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className="flex min-w-[140px] items-center gap-2 rounded-lg border border-border bg-background p-2"
                    >
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-success/10 text-success">
                        {volunteer.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{volunteer.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {volunteer.skills?.slice(0, 2).join(", ") || "General"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof AlertTriangle
  label: string
  value: string
  color: "emergency" | "success" | "primary"
}) {
  const colorClasses = {
    emergency: "bg-emergency/10 text-emergency",
    success: "bg-success/10 text-success",
    primary: "bg-secondary text-foreground",
  }

  return (
    <Card className="border-border">
      <CardContent className="flex items-center gap-3 p-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function FilterToggle({
  label,
  checked,
  onChange,
  color,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  color: "emergency" | "success" | "primary" | "warning"
}) {
  const dotColors = {
    emergency: "bg-emergency",
    success: "bg-success",
    primary: "bg-foreground",
    warning: "bg-warning",
  }

  return (
    <div className="flex items-center justify-between">
      <Label className="flex items-center gap-2 text-sm cursor-pointer">
        <div className={cn("h-2 w-2 rounded-full", dotColors[color])} />
        {label}
      </Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
