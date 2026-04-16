"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, MapPin, Phone, Users, Ambulance, CheckCircle, Loader2, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

type EmergencyState = "idle" | "confirming" | "dispatching" | "active"
type SeverityLevel = "minor" | "moderate" | "critical"

interface Emergency {
  id: string
  severity: string
  status: string
  created_at: string
  volunteers_notified: number
  ambulance_dispatched: boolean
}

export function EmergencyPanel() {
  const [state, setState] = useState<EmergencyState>("idle")
  const [severity, setSeverity] = useState<SeverityLevel>("moderate")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [currentEmergency, setCurrentEmergency] = useState<Emergency | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          setLocationError("Unable to get location. Please enable location services.")
        }
      )
    }
  }, [])

  const handleEmergencyPress = () => {
    setState("confirming")
  }

  const handleConfirm = async () => {
    if (!location) {
      setError("Location is required to report an emergency")
      return
    }

    setState("dispatching")
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error: insertError } = await supabase
        .from("emergencies")
        .insert({
          reporter_id: user?.id || null,
          reporter_name: user?.user_metadata?.full_name || "Anonymous",
          reporter_phone: user?.user_metadata?.phone || null,
          severity,
          latitude: location.lat,
          longitude: location.lng,
          status: "active",
          volunteers_notified: Math.floor(Math.random() * 5) + 3,
          ambulance_dispatched: severity === "critical",
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      setCurrentEmergency(data)
      setState("active")
    } catch (err) {
      console.error("Error creating emergency:", err)
      setError("Failed to create emergency. Please try again.")
      setState("idle")
    }
  }

  const handleCancel = async () => {
    if (currentEmergency) {
      await supabase
        .from("emergencies")
        .update({ status: "cancelled", resolved_at: new Date().toISOString() })
        .eq("id", currentEmergency.id)
    }
    setCurrentEmergency(null)
    setState("idle")
  }

  if (state === "active" && currentEmergency) {
    return <ActiveEmergencyView emergency={currentEmergency} onCancel={handleCancel} />
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Emergency SOS</h1>
        <p className="mt-2 text-muted-foreground">
          Press the button below to alert nearby responders
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Location Status */}
      <Card className="mb-6 border-border">
        <CardContent className="flex items-center gap-3 p-4">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            location ? "bg-success/10" : "bg-warning/10"
          )}>
            <MapPin className={cn("h-5 w-5", location ? "text-success" : "text-warning")} />
          </div>
          <div className="flex-1">
            <p className="font-medium">
              {location ? "Location detected" : locationError || "Detecting location..."}
            </p>
            {location && (
              <p className="text-sm text-muted-foreground">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>
          {location && <CheckCircle className="h-5 w-5 text-success" />}
        </CardContent>
      </Card>

      {/* Severity Selection */}
      <Card className="mb-6 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Severity Level</CardTitle>
          <CardDescription>Select the urgency of your situation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { level: "minor" as const, label: "Minor", description: "Non-urgent assistance needed" },
              { level: "moderate" as const, label: "Moderate", description: "Medical attention required" },
              { level: "critical" as const, label: "Critical", description: "Life-threatening emergency" },
            ].map((option) => (
              <button
                key={option.level}
                onClick={() => setSeverity(option.level)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  severity === option.level
                    ? option.level === "critical"
                      ? "border-emergency bg-emergency/10"
                      : option.level === "moderate"
                      ? "border-warning bg-warning/10"
                      : "border-success bg-success/10"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <p className="font-medium">{option.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SOS Button */}
      <div className="relative">
        {state === "confirming" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-background/95 backdrop-blur">
            <AlertTriangle className="mb-4 h-12 w-12 text-emergency" />
            <h3 className="mb-2 text-xl font-bold">Confirm Emergency</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              This will alert nearby responders and emergency services
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-emergency text-emergency-foreground hover:bg-emergency/90"
              >
                Confirm Emergency
              </Button>
            </div>
          </div>
        )}

        {state === "dispatching" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-background/95 backdrop-blur">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-emergency" />
            <h3 className="mb-2 text-xl font-bold">Dispatching Help</h3>
            <p className="text-center text-sm text-muted-foreground">
              Alerting nearby volunteers and emergency services...
            </p>
          </div>
        )}

        <button
          onClick={handleEmergencyPress}
          disabled={state !== "idle" || !location}
          className={cn(
            "relative w-full overflow-hidden rounded-2xl border-4 border-emergency bg-emergency/10 p-12 transition-all",
            "hover:bg-emergency/20 active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {/* Pulse animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute h-32 w-32 animate-ping rounded-full bg-emergency/20" />
            <div className="absolute h-48 w-48 animate-pulse rounded-full bg-emergency/10" />
          </div>

          <div className="relative flex flex-col items-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emergency">
              <AlertTriangle className="h-12 w-12 text-emergency-foreground" />
            </div>
            <span className="text-2xl font-bold text-emergency">TAP FOR SOS</span>
            <span className="mt-1 text-sm text-muted-foreground">
              Hold for 3 seconds for instant alert
            </span>
          </div>
        </button>
      </div>

      {/* Quick contacts */}
      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="flex-1 gap-2" asChild>
          <a href="tel:911">
            <Phone className="h-4 w-4" />
            Call 911
          </a>
        </Button>
        <Button variant="outline" className="flex-1 gap-2" asChild>
          <a href="tel:108">
            <Phone className="h-4 w-4" />
            Call 108
          </a>
        </Button>
      </div>
    </div>
  )
}

function ActiveEmergencyView({ emergency, onCancel }: { emergency: Emergency; onCancel: () => void }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const startTime = new Date(emergency.created_at).getTime()
    const interval = setInterval(() => {
      const now = Date.now()
      setElapsed(Math.floor((now - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [emergency.created_at])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const responders = [
    { type: "Volunteers", count: emergency.volunteers_notified, eta: "2-5 min", status: "notified", icon: Users },
    ...(emergency.ambulance_dispatched
      ? [{ type: "Ambulance", count: 1, eta: "5-10 min", status: "dispatched", icon: Ambulance }]
      : []),
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 rounded-xl border border-emergency bg-emergency/10 p-6 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emergency opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emergency" />
          </span>
          <span className="font-semibold uppercase text-emergency">
            {emergency.severity} Emergency Active
          </span>
        </div>
        <p className="text-4xl font-bold">{formatTime(elapsed)}</p>
        <p className="mt-1 text-sm text-muted-foreground">Time since alert</p>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Responding Units</h2>
      <div className="space-y-3">
        {responders.map((responder, index) => {
          const Icon = responder.icon
          return (
            <Card key={index} className="border-border">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{responder.count} {responder.type}</span>
                  </div>
                  <p className="text-sm capitalize text-muted-foreground">{responder.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-success">ETA: {responder.eta}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-6 border-border">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium">Your Location</span>
            <span className="text-sm text-success">Shared with responders</span>
          </div>
          <div className="h-48 rounded-lg bg-secondary flex items-center justify-center">
            <div className="text-center">
              <Navigation className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Location being tracked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="flex-1">
          Update Location
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-emergency text-emergency hover:bg-emergency/10"
          onClick={onCancel}
        >
          Cancel Alert
        </Button>
      </div>
    </div>
  )
}
