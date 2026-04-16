export function StatsSection() {
  const stats = [
    {
      value: "3.2min",
      label: "Average Response Time",
      description: "Volunteers reach victims faster than traditional services",
    },
    {
      value: "89%",
      label: "Faster Than Average",
      description: "Compared to ambulance-only response systems",
    },
    {
      value: "12,400+",
      label: "Lives Impacted",
      description: "Emergency responses coordinated through our platform",
    },
    {
      value: "99.9%",
      label: "Uptime Reliability",
      description: "Because emergencies never wait",
    },
  ]

  return (
    <section className="border-b border-border bg-card py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl font-bold tracking-tight md:text-5xl">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-foreground">{stat.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
