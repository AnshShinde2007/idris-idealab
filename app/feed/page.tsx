import { Navigation } from "@/components/navigation"
import { InformationFeed } from "@/components/feed/information-feed"

export const metadata = {
  title: "Information Feed - CrisisSync",
  description: "Verified incident reports and community updates with rumor detection.",
}

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="px-4 py-8 md:px-6">
        <InformationFeed />
      </main>
    </div>
  )
}
