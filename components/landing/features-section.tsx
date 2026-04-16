import { AlertTriangle, Users, Ambulance, Building2, MessageSquare, MapPin } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: AlertTriangle,
      title: "Smart SOS Trigger",
      description: "One tap emergency alert that automatically shares your location, detects severity, and dispatches help to nearby responders.",
      tag: "Core Feature",
    },
    {
      icon: Users,
      title: "Nearby Helper Network",
      description: "Crowdsourced first response. Trained volunteers within 2-3km receive instant alerts and can reach you faster than ambulances.",
      tag: "Unique",
    },
    {
      icon: Ambulance,
      title: "Live Ambulance Tracking",
      description: "Real-time ambulance locations with traffic-aware smart routing. Know exactly when help will arrive.",
      tag: "Real-time",
    },
    {
      icon: Building2,
      title: "Hospital Dashboard",
      description: "Live availability of ICU beds, ER capacity, and specialist availability. No more wasted time choosing destinations.",
      tag: "Integration",
    },
    {
      icon: MessageSquare,
      title: "Verified Info Feed",
      description: "Community incident reports with verification system. Rumor detection ensures only accurate information spreads.",
      tag: "Anti-Rumor",
    },
    {
      icon: MapPin,
      title: "Crisis Heatmap",
      description: "Live visualization of accidents, congestion, and danger zones. Helps authorities and emergency teams coordinate better.",
      tag: "Analytics",
    },
  ]

  return (
    <section className="border-b border-border py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Built for real emergencies
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Every feature is designed to reduce response time and save lives. 
            We combine crowd-sourcing with smart technology.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors hover:border-muted-foreground/50"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
