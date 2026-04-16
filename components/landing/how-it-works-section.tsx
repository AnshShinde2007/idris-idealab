import { Phone, Bell, MapPin, Heart } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: Phone,
      step: "01",
      title: "Trigger Emergency",
      description: "Press the SOS button or shake your phone. Location is automatically detected and shared.",
    },
    {
      icon: Bell,
      step: "02",
      title: "Alerts Dispatched",
      description: "Nearby volunteers, ambulances, and hospitals receive instant notifications with your location.",
    },
    {
      icon: MapPin,
      step: "03",
      title: "Help Arrives",
      description: "Track responders in real-time. Closest volunteer reaches you while ambulance is en route.",
    },
    {
      icon: Heart,
      step: "04",
      title: "Care Coordinated",
      description: "Hospital is pre-notified with patient info. No delays at admission.",
    },
  ]

  return (
    <section className="border-b border-border bg-card py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            From emergency to response in under 4 minutes. Our system coordinates multiple responders simultaneously.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border lg:block" />

          <div className="grid gap-8 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  {/* Connection dot */}
                  <div className="absolute left-1/2 top-0 hidden h-4 w-4 -translate-x-1/2 -translate-y-2 rounded-full border-4 border-background bg-border lg:block" />
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                      <Icon className="h-7 w-7 text-foreground" />
                    </div>
                    <span className="mb-2 text-xs font-medium text-emergency">{step.step}</span>
                    <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
