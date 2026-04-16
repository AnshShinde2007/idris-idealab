"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { 
  Building2, 
  Bed, 
  Heart, 
  Stethoscope, 
  Search,
  MapPin,
  Clock,
  Phone,
  ChevronDown,
  Filter,
  ArrowUpDown,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

interface Hospital {
  id: string
  name: string
  address: string
  phone: string | null
  latitude: number
  longitude: number
  icu_beds_total: number
  icu_beds_available: number
  er_beds_total: number
  er_beds_available: number
  general_beds_total: number
  general_beds_available: number
  specialties: string[]
  status: string
  last_updated: string
}

type SortOption = "name" | "icu" | "er"

export function HospitalDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("name")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const supabase = createClient()

  const fetchHospitals = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .order("name")

    if (error) {
      console.error("Error fetching hospitals:", error)
    } else {
      setHospitals(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHospitals()

    // Set up real-time subscription
    const channel = supabase
      .channel("hospitals-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hospitals" },
        () => {
          fetchHospitals()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredHospitals = hospitals
    .filter((hospital) => {
      const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = !statusFilter || hospital.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "icu":
          return b.icu_beds_available - a.icu_beds_available
        case "er":
          return b.er_beds_available - a.er_beds_available
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const totalStats = hospitals.reduce(
    (acc, hospital) => ({
      icuAvailable: acc.icuAvailable + hospital.icu_beds_available,
      icuTotal: acc.icuTotal + hospital.icu_beds_total,
      erAvailable: acc.erAvailable + hospital.er_beds_available,
      erTotal: acc.erTotal + hospital.er_beds_total,
    }),
    { icuAvailable: 0, icuTotal: 0, erAvailable: 0, erTotal: 0 }
  )

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto h-8 w-8" />
          <p className="mt-4 text-muted-foreground">Loading hospitals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Hospital Availability</h1>
          <p className="mt-2 text-muted-foreground">
            Real-time bed availability across hospitals in your area
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchHospitals}>
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emergency/10">
              <Heart className="h-6 w-6 text-emergency" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ICU Beds</p>
              <p className="text-2xl font-bold">
                {totalStats.icuAvailable}
                <span className="text-sm font-normal text-muted-foreground">/{totalStats.icuTotal}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Stethoscope className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ER Beds</p>
              <p className="text-2xl font-bold">
                {totalStats.erAvailable}
                <span className="text-sm font-normal text-muted-foreground">/{totalStats.erTotal}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Building2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Hospitals</p>
              <p className="text-2xl font-bold">
                {hospitals.filter((h) => h.status === "available").length}
                <span className="text-sm font-normal text-muted-foreground">/{hospitals.length}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <Clock className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hospitals</p>
              <p className="text-2xl font-bold">{hospitals.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search hospitals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : "All Status"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("available")}>Available</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("limited")}>Limited</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("full")}>Full</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("name")}>Name</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("icu")}>ICU Availability</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("er")}>ER Availability</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Hospital List */}
      {filteredHospitals.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">No hospitals found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHospitals.map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))}
        </div>
      )}
    </div>
  )
}

function HospitalCard({ hospital }: { hospital: Hospital }) {
  const statusStyles = {
    available: "bg-success/10 text-success",
    limited: "bg-warning/10 text-warning",
    full: "bg-emergency/10 text-emergency",
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Main info */}
          <div className="flex-1 p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{hospital.name}</h3>
                  <Badge className={cn("capitalize", statusStyles[hospital.status as keyof typeof statusStyles] || statusStyles.available)}>
                    {hospital.status}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {hospital.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Updated {getTimeAgo(hospital.last_updated)}
                  </span>
                </div>
              </div>
            </div>

            {/* Specialists */}
            <div className="flex flex-wrap gap-2">
              {hospital.specialties?.map((specialist) => (
                <Badge key={specialist} variant="secondary" className="text-xs">
                  {specialist}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bed availability */}
          <div className="flex border-t border-border lg:border-l lg:border-t-0">
            <BedStat
              label="ICU"
              available={hospital.icu_beds_available}
              total={hospital.icu_beds_total}
            />
            <BedStat
              label="ER"
              available={hospital.er_beds_available}
              total={hospital.er_beds_total}
            />
            <BedStat
              label="General"
              available={hospital.general_beds_available}
              total={hospital.general_beds_total}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 border-t border-border p-4 lg:flex-col lg:border-l lg:border-t-0">
            {hospital.phone && (
              <Button asChild className="flex-1 gap-2 lg:w-full" size="sm">
                <a href={`tel:${hospital.phone}`}>
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1 lg:w-full"
              size="sm"
              asChild
            >
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Directions
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BedStat({
  label,
  available,
  total,
}: {
  label: string
  available: number
  total: number
}) {
  const percentage = total > 0 ? (available / total) * 100 : 0
  const isLow = percentage < 20
  const isMedium = percentage >= 20 && percentage < 50

  return (
    <div className="flex flex-col items-center justify-center border-r border-border px-6 py-4 last:border-r-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn(
        "text-2xl font-bold",
        isLow ? "text-emergency" : isMedium ? "text-warning" : "text-success"
      )}>
        {available}
      </p>
      <p className="text-xs text-muted-foreground">of {total}</p>
      <div className="mt-2 h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full",
            isLow ? "bg-emergency" : isMedium ? "bg-warning" : "bg-success"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
