import { Navigation } from "@/components/navigation"
import { VolunteerPortal } from "@/components/volunteer/volunteer-portal"

export const metadata = {
  title: "Volunteer Portal - CrisisSync",
  description: "Join the CrisisSync volunteer network and help save lives in your community.",
}

export default function VolunteerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="px-4 py-8 md:px-6">
        <VolunteerPortal />
      </main>
    </div>
  )
}
