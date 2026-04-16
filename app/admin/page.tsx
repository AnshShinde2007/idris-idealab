import { Navigation } from "@/components/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export const metadata = {
  title: "Admin Dashboard - CrisisSync",
  description: "Administrative dashboard for managing emergencies, volunteers, and system resources.",
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="px-4 py-8 md:px-6">
        <AdminDashboard />
      </main>
    </div>
  )
}
