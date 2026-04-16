import { Navigation } from "@/components/navigation"
import { EmergencyPanel } from "@/components/emergency/emergency-panel"

export const metadata = {
  title: "Emergency SOS - CrisisSync",
  description: "Trigger an emergency alert to dispatch nearby help immediately.",
}

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="px-4 py-8 md:px-6">
        <EmergencyPanel />
      </main>
    </div>
  )
}
