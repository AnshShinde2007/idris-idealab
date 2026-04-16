import { Navigation } from "@/components/navigation"
import { LiveMapDashboard } from "@/components/map/live-map-dashboard"

export const metadata = {
  title: "Live Map - CrisisSync",
  description: "Real-time view of emergencies, volunteers, ambulances, and hospitals in your area.",
}

export default function MapPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <LiveMapDashboard />
      </main>
    </div>
  )
}
