import { Navigation } from "@/components/navigation"
import { HospitalDashboard } from "@/components/hospitals/hospital-dashboard"

export const metadata = {
  title: "Hospital Availability - CrisisSync",
  description: "Real-time hospital bed availability, ER capacity, and specialist availability.",
}

export default function HospitalsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="px-4 py-8 md:px-6">
        <HospitalDashboard />
      </main>
    </div>
  )
}
