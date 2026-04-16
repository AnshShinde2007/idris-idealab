import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export function Footer() {
  const links = {
    Platform: [
      { label: "Emergency SOS", href: "/emergency" },
      { label: "Live Map", href: "/map" },
      { label: "Hospitals", href: "/hospitals" },
      { label: "Info Feed", href: "/feed" },
    ],
    Community: [
      { label: "Become a Volunteer", href: "/volunteer" },
      { label: "Training Resources", href: "#" },
      { label: "Success Stories", href: "#" },
      { label: "Partner With Us", href: "#" },
    ],
    Resources: [
      { label: "Documentation", href: "#" },
      { label: "API Access", href: "#" },
      { label: "For Hospitals", href: "#" },
      { label: "For Authorities", href: "#" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Contact", href: "#" },
    ],
  }

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emergency">
                <AlertTriangle className="h-5 w-5 text-emergency-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">CrisisSync</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
              Real-time emergency coordination connecting victims, volunteers, ambulances, and hospitals for faster crisis response.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} CrisisSync. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built for saving lives.
          </p>
        </div>
      </div>
    </footer>
  )
}
