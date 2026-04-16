"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle,
  Award,
  AlertTriangle,
  Bell,
  Settings,
  ChevronRight,
  Heart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Volunteer {
  id: string
  user_id: string
  full_name: string
  phone: string
  skills: string[]
  certifications: string[]
  is_available: boolean
  latitude: number | null
  longitude: number | null
  response_radius_km: number
  total_responses: number
}

interface Emergency {
  id: string
  severity: string
  description: string | null
  latitude: number
  longitude: number
  address: string | null
  status: string
  created_at: string
}

export function VolunteerPortal() {
  const [user, setUser] = useState<User | null>(null)
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeEmergencies, setActiveEmergencies] = useState<Emergency[]>([])
  const [activeTab, setActiveTab] = useState("alerts")
  const supabase = createClient()

  useEffect(() => {
    const checkVolunteerStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: volunteerData } = await supabase
          .from("volunteers")
          .select("*")
          .eq("user_id", user.id)
          .single()

        setVolunteer(volunteerData)

        // Fetch active emergencies
        const { data: emergencies } = await supabase
          .from("emergencies")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(10)

        setActiveEmergencies(emergencies || [])
      }

      setLoading(false)
    }

    checkVolunteerStatus()

    // Subscribe to new emergencies
    const channel = supabase
      .channel("emergencies-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "emergencies" },
        () => {
          // Refetch emergencies when changes occur
          supabase
            .from("emergencies")
            .select("*")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(10)
            .then(({ data }) => setActiveEmergencies(data || []))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const toggleAvailability = async () => {
    if (!volunteer) return

    const newAvailability = !volunteer.is_available
    const { error } = await supabase
      .from("volunteers")
      .update({ is_available: newAvailability, updated_at: new Date().toISOString() })
      .eq("id", volunteer.id)

    if (!error) {
      setVolunteer({ ...volunteer, is_available: newAvailability })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto h-8 w-8" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <Users className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Become a Volunteer</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to join our network of first responders
          </p>
        </div>
        <Button asChild className="bg-emergency hover:bg-emergency/90">
          <a href="/auth/login">Sign In to Continue</a>
        </Button>
      </div>
    )
  }

  if (!volunteer) {
    return <RegistrationForm user={user} onRegister={setVolunteer} />
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Volunteer Portal</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {volunteer.full_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm">
            {volunteer.is_available ? "Available" : "Unavailable"}
          </span>
          <Switch
            checked={volunteer.is_available}
            onCheckedChange={toggleAvailability}
          />
        </div>
      </div>

      {/* Status Card */}
      <Card className={cn(
        "mb-6 border-2",
        volunteer.is_available ? "border-success bg-success/5" : "border-muted"
      )}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              volunteer.is_available ? "bg-success/10" : "bg-muted"
            )}>
              <Users className={cn("h-6 w-6", volunteer.is_available ? "text-success" : "text-muted-foreground")} />
            </div>
            <div>
              <p className="font-semibold">
                {volunteer.is_available ? "You are available for alerts" : "You are currently unavailable"}
              </p>
              <p className="text-sm text-muted-foreground">
                {volunteer.is_available
                  ? `You will receive emergency alerts within ${volunteer.response_radius_km}km`
                  : "Toggle availability to receive alerts"}
              </p>
            </div>
          </div>
          {volunteer.is_available && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
              </span>
              <span className="text-sm text-success">Active</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard icon={Heart} label="Responses" value={volunteer.total_responses.toString()} />
        <StatCard icon={Clock} label="Avg Response" value="3.5 min" />
        <StatCard icon={Award} label="Skills" value={volunteer.skills.length.toString()} />
        <StatCard icon={MapPin} label="Range" value={`${volunteer.response_radius_km} km`} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Active Alerts
            {activeEmergencies.length > 0 && (
              <Badge className="ml-1 bg-emergency text-emergency-foreground">
                {activeEmergencies.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          {activeEmergencies.length === 0 ? (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">No active alerts</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You will be notified when emergencies occur nearby
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeEmergencies.map((emergency) => (
                <AlertCard key={emergency.id} emergency={emergency} volunteerId={volunteer.id} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive emergency alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Alerts</p>
                  <p className="text-sm text-muted-foreground">Backup SMS for critical emergencies</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="border-t border-border pt-4">
                <p className="font-medium">Alert Radius</p>
                <p className="mb-3 text-sm text-muted-foreground">
                  Maximum distance for receiving alerts
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 5].map((km) => (
                    <Button
                      key={km}
                      variant={km === volunteer.response_radius_km ? "default" : "outline"}
                      size="sm"
                    >
                      {km} km
                    </Button>
                  ))}
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="font-medium">Your Skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {volunteer.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Heart
  label: string
  value: string
}) {
  return (
    <Card className="border-border">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function AlertCard({ emergency, volunteerId }: { emergency: Emergency; volunteerId: string }) {
  const [responded, setResponded] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleAccept = async () => {
    setLoading(true)
    const { error } = await supabase
      .from("emergency_responses")
      .insert({
        emergency_id: emergency.id,
        volunteer_id: volunteerId,
        status: "accepted",
      })

    if (!error) {
      setResponded(true)
    }
    setLoading(false)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    return `${Math.floor(diffMins / 60)}h ago`
  }

  if (responded) {
    return (
      <Card className="border-success bg-success/5">
        <CardContent className="flex items-center justify-center gap-3 p-6">
          <CheckCircle className="h-6 w-6 text-success" />
          <span className="font-medium text-success">Response confirmed - Help is on the way!</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "border-2",
      emergency.severity === "critical" ? "border-emergency" : "border-warning"
    )}>
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-6">
            <div className="mb-3 flex items-center gap-3">
              <AlertTriangle className={cn(
                "h-5 w-5",
                emergency.severity === "critical" ? "text-emergency" : "text-warning"
              )} />
              <span className="font-semibold capitalize">{emergency.severity} Emergency</span>
              <Badge className={cn(
                emergency.severity === "critical"
                  ? "bg-emergency/10 text-emergency"
                  : "bg-warning/10 text-warning"
              )}>
                {emergency.severity}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              {emergency.address && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {emergency.address}
                </p>
              )}
              <p className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {getTimeAgo(emergency.created_at)}
              </p>
              {emergency.description && (
                <p className="text-muted-foreground">{emergency.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 border-t border-border p-4 lg:flex-col lg:border-l lg:border-t-0">
            <Button
              className="flex-1 gap-2 bg-success text-success-foreground hover:bg-success/90"
              onClick={handleAccept}
              disabled={loading}
            >
              {loading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Accept
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <XCircle className="h-4 w-4" />
              Decline
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RegistrationForm({ user, onRegister }: { user: User; onRegister: (volunteer: Volunteer) => void }) {
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || "")
  const [phone, setPhone] = useState(user.user_metadata?.phone || "")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const availableSkills = ["First Aid", "CPR", "Medical Training", "Trauma Care", "Fire Safety"]

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Get current location
    let latitude: number | null = null
    let longitude: number | null = null

    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        latitude = position.coords.latitude
        longitude = position.coords.longitude
      } catch {
        // Location not available, continue without it
      }
    }

    const { data, error: insertError } = await supabase
      .from("volunteers")
      .insert({
        user_id: user.id,
        full_name: fullName,
        phone,
        skills: selectedSkills,
        certifications: [],
        is_available: true,
        latitude,
        longitude,
        response_radius_km: 3,
        total_responses: 0,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    onRegister(data)
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <Users className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Become a Volunteer</h1>
        <p className="mt-2 text-muted-foreground">
          Join our network of first responders and help save lives in your community
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Registration</CardTitle>
          <CardDescription>Fill in your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Skills (select all that apply)</FieldLabel>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Field>
            </FieldGroup>

            {error && (
              <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="mt-6 w-full" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Registering...
                </>
              ) : (
                <>
                  Complete Registration
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
