"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  MessageSquare,
  ThumbsUp,
  MapPin,
  Clock,
  Search,
  Plus,
  Users,
  Shield,
  Flag
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

type VerificationStatus = "verified" | "unverified" | "false"

interface IncidentReport {
  id: string
  reporter_id: string | null
  reporter_name: string | null
  title: string
  description: string
  category: string
  latitude: number | null
  longitude: number | null
  location_text: string | null
  verification_status: VerificationStatus
  confirmations: number
  created_at: string
}

export function InformationFeed() {
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<IncidentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "all">("all")
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const supabase = createClient()

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("incident_reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setReports(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
    fetchReports()

    // Subscribe to changes
    const channel = supabase
      .channel("incident-reports-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incident_reports" },
        () => fetchReports()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || report.verification_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    verified: reports.filter((p) => p.verification_status === "verified").length,
    unverified: reports.filter((p) => p.verification_status === "unverified").length,
    false: reports.filter((p) => p.verification_status === "false").length,
  }

  const handleReportSubmit = async (data: {
    title: string
    description: string
    category: string
    location: string
  }) => {
    const { error } = await supabase
      .from("incident_reports")
      .insert({
        reporter_id: user?.id || null,
        reporter_name: user?.user_metadata?.full_name || "Anonymous",
        title: data.title,
        description: data.description,
        category: data.category,
        location_text: data.location,
        verification_status: "unverified",
        confirmations: 0,
      })

    if (!error) {
      setIsReportDialogOpen(false)
      fetchReports()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto h-8 w-8" />
          <p className="mt-4 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Information Feed</h1>
          <p className="mt-2 text-muted-foreground">
            Verified incident reports from the community
          </p>
        </div>
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report an Incident</DialogTitle>
              <DialogDescription>
                Submit a new incident report. It will be reviewed for verification.
              </DialogDescription>
            </DialogHeader>
            <ReportForm onSubmit={handleReportSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Summary */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <button
          onClick={() => setStatusFilter(statusFilter === "verified" ? "all" : "verified")}
          className={cn(
            "rounded-lg border p-4 text-center transition-colors",
            statusFilter === "verified"
              ? "border-success bg-success/10"
              : "border-border hover:bg-secondary"
          )}
        >
          <CheckCircle className="mx-auto mb-2 h-6 w-6 text-success" />
          <p className="text-2xl font-bold">{statusCounts.verified}</p>
          <p className="text-xs text-muted-foreground">Verified</p>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === "unverified" ? "all" : "unverified")}
          className={cn(
            "rounded-lg border p-4 text-center transition-colors",
            statusFilter === "unverified"
              ? "border-warning bg-warning/10"
              : "border-border hover:bg-secondary"
          )}
        >
          <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-warning" />
          <p className="text-2xl font-bold">{statusCounts.unverified}</p>
          <p className="text-xs text-muted-foreground">Unverified</p>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === "false" ? "all" : "false")}
          className={cn(
            "rounded-lg border p-4 text-center transition-colors",
            statusFilter === "false"
              ? "border-emergency bg-emergency/10"
              : "border-border hover:bg-secondary"
          )}
        >
          <XCircle className="mx-auto mb-2 h-6 w-6 text-emergency" />
          <p className="text-2xl font-bold">{statusCounts.false}</p>
          <p className="text-xs text-muted-foreground">False</p>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search incidents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Feed */}
      {filteredReports.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">No reports found</p>
            <p className="text-sm text-muted-foreground">
              {reports.length === 0
                ? "Be the first to report an incident"
                : "Try adjusting your search or filters"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <FeedCard key={report.id} report={report} userId={user?.id} />
          ))}
        </div>
      )}
    </div>
  )
}

function FeedCard({ report, userId }: { report: IncidentReport; userId?: string }) {
  const [confirmed, setConfirmed] = useState(false)
  const [confirmations, setConfirmations] = useState(report.confirmations)
  const supabase = createClient()

  const statusConfig = {
    verified: {
      icon: CheckCircle,
      label: "Verified",
      className: "bg-success/10 text-success border-success/20",
    },
    unverified: {
      icon: AlertTriangle,
      label: "Unverified",
      className: "bg-warning/10 text-warning border-warning/20",
    },
    false: {
      icon: XCircle,
      label: "False",
      className: "bg-emergency/10 text-emergency border-emergency/20",
    },
  }

  const status = statusConfig[report.verification_status]
  const StatusIcon = status.icon

  const handleConfirm = async () => {
    if (!userId || confirmed) return

    const { error } = await supabase
      .from("report_confirmations")
      .insert({
        report_id: report.id,
        user_id: userId,
        is_confirmed: true,
      })

    if (!error) {
      setConfirmed(true)
      setConfirmations((prev) => prev + 1)

      // Update the report's confirmation count
      await supabase
        .from("incident_reports")
        .update({ confirmations: confirmations + 1 })
        .eq("id", report.id)
    }
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
    <Card className={cn(
      "border-border overflow-hidden",
      report.verification_status === "false" && "opacity-75"
    )}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Badge className={cn("gap-1 border", status.className)}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {report.category}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Flag className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Report as false</DropdownMenuItem>
              <DropdownMenuItem>Report as spam</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold">{report.title}</h3>
          <p className="mb-4 text-sm text-muted-foreground leading-relaxed">{report.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {report.location_text && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {report.location_text}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {getTimeAgo(report.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {report.reporter_name || "Anonymous"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-border bg-secondary/30 p-3">
          <Button
            variant={confirmed ? "default" : "outline"}
            size="sm"
            className={cn("gap-2", confirmed && "bg-success text-success-foreground hover:bg-success/90")}
            onClick={handleConfirm}
            disabled={report.verification_status === "false" || !userId}
          >
            <ThumbsUp className="h-4 w-4" />
            {confirmed ? "Confirmed" : "Confirm"}
            <span className="text-xs">({confirmations})</span>
          </Button>
          {!userId && (
            <span className="text-xs text-muted-foreground">Sign in to confirm</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ReportForm({ onSubmit }: { onSubmit: (data: { title: string; description: string; category: string; location: string }) => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("accident")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)

  const categories = ["Accident", "Fire", "Medical", "Infrastructure", "Security", "Other"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit({ title, description, category, location })
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field>
        <FieldLabel>Incident Type</FieldLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((type) => (
            <Badge
              key={type}
              variant={category === type.toLowerCase() ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCategory(type.toLowerCase())}
            >
              {type}
            </Badge>
          ))}
        </div>
      </Field>
      <Field>
        <FieldLabel htmlFor="title">Title</FieldLabel>
        <Input
          id="title"
          placeholder="Brief description of the incident"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="description">Details</FieldLabel>
        <Textarea
          id="description"
          placeholder="Provide more details about what happened..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="location">Location</FieldLabel>
        <Input
          id="location"
          placeholder="Where did this happen?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </Field>
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground">
        Your report will be reviewed for verification before being marked as confirmed.
      </p>
    </form>
  )
}
