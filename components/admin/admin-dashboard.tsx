"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle, 
  Users, 
  Building2, 
  Ambulance,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Activity,
  Shield,
  MapPin,
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

interface Emergency {
  id: string
  severity: string
  description: string | null
  address: string | null
  status: string
  volunteers_notified: number
  created_at: string
}

interface Hospital {
  id: string
  name: string
  icu_beds_total: number
  icu_beds_available: number
  er_beds_total: number
  er_beds_available: number
  general_beds_total: number
  general_beds_available: number
}

interface IncidentReport {
  id: string
  title: string
  description: string
  reporter_name: string | null
  verification_status: string
  confirmations: number
  created_at: string
}

interface Volunteer {
  id: string
  full_name: string
  is_available: boolean
}

interface AmbulanceWithHospital {
  id: string
  vehicle_number: string
  status: string
  hospital_id: string | null
  hospitals: { name: string } | null
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [emergencies, setEmergencies] = useState<Emergency[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [pendingReports, setPendingReports] = useState<IncidentReport[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [ambulances, setAmbulances] = useState<AmbulanceWithHospital[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)

    const [emergenciesRes, hospitalsRes, reportsRes, volunteersRes, ambulancesRes] = await Promise.all([
      supabase
        .from("emergencies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("hospitals")
        .select("*"),
      supabase
        .from("incident_reports")
        .select("*")
        .eq("verification_status", "unverified")
        .order("created_at", { ascending: false }),
      supabase
        .from("volunteers")
        .select("*"),
      supabase
        .from("ambulances")
        .select("*, hospitals(name)")
    ])

    if (emergenciesRes.data) setEmergencies(emergenciesRes.data)
    if (hospitalsRes.data) setHospitals(hospitalsRes.data)
    if (reportsRes.data) setPendingReports(reportsRes.data)
    if (volunteersRes.data) setVolunteers(volunteersRes.data)
    if (ambulancesRes.data) setAmbulances(ambulancesRes.data as AmbulanceWithHospital[])

    setLoading(false)
  }

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel("admin-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "emergencies" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "incident_reports" }, () => fetchData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleVerifyReport = async (reportId: string, status: "verified" | "false") => {
    await supabase
      .from("incident_reports")
      .update({ verification_status: status })
      .eq("id", reportId)
    fetchData()
  }

  const handleResolveEmergency = async (emergencyId: string) => {
    await supabase
      .from("emergencies")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", emergencyId)
    fetchData()
  }

  const activeEmergencies = emergencies.filter(e => e.status === "active")
  const onlineVolunteers = volunteers.filter(v => v.is_available)
  const availableAmbulances = ambulances.filter(a => a.status === "available")

  const totalIcuBeds = hospitals.reduce((sum, h) => sum + h.icu_beds_total, 0)
  const availableIcuBeds = hospitals.reduce((sum, h) => sum + h.icu_beds_available, 0)
  const totalErBeds = hospitals.reduce((sum, h) => sum + h.er_beds_total, 0)
  const availableErBeds = hospitals.reduce((sum, h) => sum + h.er_beds_available, 0)
  const totalGeneralBeds = hospitals.reduce((sum, h) => sum + h.general_beds_total, 0)
  const availableGeneralBeds = hospitals.reduce((sum, h) => sum + h.general_beds_available, 0)

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

  // Group ambulances by hospital
  const ambulancesByHospital = hospitals.map(hospital => ({
    hospital: hospital.name,
    total: ambulances.filter(a => a.hospital_id === hospital.id).length,
    available: ambulances.filter(a => a.hospital_id === hospital.id && a.status === "available").length
  })).filter(h => h.total > 0)

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                System overview and incident management
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={AlertTriangle}
          label="Active Incidents"
          value={String(activeEmergencies.length)}
          trend={{ value: activeEmergencies.length > 0 ? "Active" : "None", positive: activeEmergencies.length === 0 }}
          color="emergency"
        />
        <StatCard
          icon={Users}
          label="Volunteers Online"
          value={String(onlineVolunteers.length)}
          trend={{ value: `/${volunteers.length} total`, positive: true }}
          color="success"
        />
        <StatCard
          icon={Ambulance}
          label="Available Ambulances"
          value={String(availableAmbulances.length)}
          trend={{ value: `/${ambulances.length} total`, positive: availableAmbulances.length > 2 }}
          color="primary"
        />
        <StatCard
          icon={Activity}
          label="System Health"
          value="99.9%"
          trend={{ value: "Stable", positive: true }}
          color="success"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="verification">
            Verification
            {pendingReports.length > 0 && (
              <Badge className="ml-2 bg-warning/10 text-warning" variant="secondary">
                {pendingReports.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Active Incidents */}
            <Card className="border-border lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Incidents</CardTitle>
                  <CardDescription>Real-time incident monitoring</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("incidents")}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {activeEmergencies.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No active incidents</p>
                ) : (
                  <div className="space-y-3">
                    {activeEmergencies.slice(0, 5).map((emergency) => (
                      <IncidentRow 
                        key={emergency.id} 
                        incident={emergency} 
                        getTimeAgo={getTimeAgo}
                        onResolve={() => handleResolveEmergency(emergency.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resource Allocation */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Resource Status</CardTitle>
                <CardDescription>Current availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ResourceBar 
                    type="Volunteers" 
                    available={onlineVolunteers.length} 
                    total={volunteers.length} 
                  />
                  <ResourceBar 
                    type="Ambulances" 
                    available={availableAmbulances.length} 
                    total={ambulances.length} 
                  />
                  <ResourceBar 
                    type="ICU Beds" 
                    available={availableIcuBeds} 
                    total={totalIcuBeds} 
                  />
                  <ResourceBar 
                    type="ER Beds" 
                    available={availableErBeds} 
                    total={totalErBeds} 
                  />
                  <ResourceBar 
                    type="General Beds" 
                    available={availableGeneralBeds} 
                    total={totalGeneralBeds} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>All Incidents</CardTitle>
              <CardDescription>Complete incident history and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Severity</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emergencies.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          No incidents recorded yet
                        </td>
                      </tr>
                    ) : (
                      emergencies.map((emergency) => (
                        <tr key={emergency.id} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3 text-sm font-mono">{emergency.id.slice(0, 8)}</td>
                          <td className="px-4 py-3 text-sm">{emergency.address || "Unknown"}</td>
                          <td className="px-4 py-3">
                            <Badge className={cn(
                              emergency.severity === "critical"
                                ? "bg-emergency/10 text-emergency"
                                : emergency.severity === "moderate"
                                ? "bg-warning/10 text-warning"
                                : "bg-success/10 text-success"
                            )}>
                              {emergency.severity}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="capitalize">
                              {emergency.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {getTimeAgo(emergency.created_at)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Assign Resources</DropdownMenuItem>
                                {emergency.status === "active" && (
                                  <DropdownMenuItem onClick={() => handleResolveEmergency(emergency.id)}>
                                    Mark Resolved
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Pending Verification</CardTitle>
              <CardDescription>Community reports awaiting verification</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReports.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No reports pending verification
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border p-4"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{report.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {report.description}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          By {report.reporter_name || "Anonymous"} - {getTimeAgo(report.created_at)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {report.confirmations} community confirmations
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="h-4 w-4" />
                          Review
                        </Button>
                        <Button 
                          size="sm" 
                          className="gap-1 bg-success text-success-foreground hover:bg-success/90"
                          onClick={() => handleVerifyReport(report.id, "verified")}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Verify
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1 text-emergency hover:bg-emergency/10"
                          onClick={() => handleVerifyReport(report.id, "false")}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Hospital Bed Availability</CardTitle>
                <CardDescription>Current bed status by hospital</CardDescription>
              </CardHeader>
              <CardContent>
                {hospitals.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No hospital data available
                  </p>
                ) : (
                  <div className="space-y-4">
                    {hospitals.map((hospital) => (
                      <div key={hospital.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{hospital.name}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              hospital.icu_beds_available > 0 
                                ? "bg-success/10 text-success" 
                                : "bg-emergency/10 text-emergency"
                            )}
                          >
                            ICU: {hospital.icu_beds_available}/{hospital.icu_beds_total}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              hospital.er_beds_available > 3 
                                ? "bg-success/10 text-success" 
                                : hospital.er_beds_available > 0
                                ? "bg-warning/10 text-warning"
                                : "bg-emergency/10 text-emergency"
                            )}
                          >
                            ER: {hospital.er_beds_available}/{hospital.er_beds_total}
                          </Badge>
                          <Badge variant="secondary">
                            Gen: {hospital.general_beds_available}/{hospital.general_beds_total}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Ambulance Fleet</CardTitle>
                <CardDescription>Fleet status by hospital</CardDescription>
              </CardHeader>
              <CardContent>
                {ambulancesByHospital.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No ambulance data available
                  </p>
                ) : (
                  <div className="space-y-3">
                    {ambulancesByHospital.map((fleet) => (
                      <div key={fleet.hospital} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Ambulance className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{fleet.hospital}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              fleet.available > 3 
                                ? "bg-success/10 text-success" 
                                : fleet.available > 1 
                                ? "bg-warning/10 text-warning"
                                : "bg-emergency/10 text-emergency"
                            )}
                          >
                            {fleet.available} available
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            / {fleet.total}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: typeof AlertTriangle
  label: string
  value: string
  trend: { value: string; positive: boolean }
  color: "emergency" | "success" | "primary"
}) {
  const colorClasses = {
    emergency: "bg-emergency/10 text-emergency",
    success: "bg-success/10 text-success",
    primary: "bg-secondary text-foreground",
  }

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorClasses[color])}>
            <Icon className="h-5 w-5" />
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs",
            trend.positive ? "text-success" : "text-emergency"
          )}>
            {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.value}
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

function IncidentRow({ 
  incident, 
  getTimeAgo,
  onResolve
}: { 
  incident: Emergency
  getTimeAgo: (timestamp: string) => string
  onResolve: () => void
}) {
  const statusColors = {
    active: "bg-emergency",
    responding: "bg-warning",
    resolved: "bg-success",
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border p-3">
      <div className={cn(
        "h-2 w-2 rounded-full",
        statusColors[incident.status as keyof typeof statusColors] || "bg-muted"
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{incident.id.slice(0, 8)}</span>
          <Badge className={cn(
            "text-xs",
            incident.severity === "critical"
              ? "bg-emergency/10 text-emergency"
              : incident.severity === "moderate"
              ? "bg-warning/10 text-warning"
              : "bg-success/10 text-success"
          )}>
            {incident.severity}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {incident.address || "Location pending..."}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm capitalize">{incident.status}</p>
        <p className="text-xs text-muted-foreground">{getTimeAgo(incident.created_at)}</p>
      </div>
      {incident.status === "active" && (
        <Button size="sm" variant="outline" onClick={onResolve}>
          Resolve
        </Button>
      )}
    </div>
  )
}

function ResourceBar({ type, available, total }: { type: string; available: number; total: number }) {
  const percentage = total > 0 ? (available / total) * 100 : 0
  const isLow = percentage < 30
  const isMedium = percentage >= 30 && percentage < 60

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm">{type}</span>
        <span className="text-sm font-medium">
          {available}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isLow ? "bg-emergency" : isMedium ? "bg-warning" : "bg-success"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
