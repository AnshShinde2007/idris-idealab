import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Users, ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      <div className="relative px-4 py-24 md:px-6 md:py-32 lg:py-40">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emergency opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emergency" />
            </span>
            Real-time Emergency Response
          </div>

          {/* Heading */}
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Every second counts.
            <br />
            <span className="text-muted-foreground">We make them count more.</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            CrisisSync connects emergency victims with nearby volunteers, ambulances, and hospitals in real-time. 
            Crowdsourced first response meets intelligent routing.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/emergency">
              <Button size="lg" className="h-12 gap-2 bg-emergency px-8 text-emergency-foreground hover:bg-emergency/90">
                <AlertTriangle className="h-5 w-5" />
                Report Emergency
              </Button>
            </Link>
            <Link href="/volunteer">
              <Button size="lg" variant="outline" className="h-12 gap-2 px-8">
                <Users className="h-5 w-5" />
                Become a Volunteer
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>24/7 Active Network</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>Verified Information Only</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>500+ Registered Volunteers</span>
            </div>
          </div>
        </div>

        {/* Preview card */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-emergency" />
              <div className="h-3 w-3 rounded-full bg-warning" />
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="ml-2 text-sm text-muted-foreground">Live Dashboard</span>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-3">
              <DashboardCard
                label="Active Emergencies"
                value="12"
                trend="-2 from last hour"
                color="emergency"
              />
              <DashboardCard
                label="Volunteers Online"
                value="247"
                trend="+18 from last hour"
                color="success"
              />
              <DashboardCard
                label="Avg Response Time"
                value="4.2m"
                trend="12% faster than average"
                color="primary"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardCard({
  label,
  value,
  trend,
  color,
}: {
  label: string
  value: string
  trend: string
  color: "emergency" | "success" | "primary"
}) {
  const colorClasses = {
    emergency: "text-emergency",
    success: "text-success",
    primary: "text-foreground",
  }

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
    </div>
  )
}
