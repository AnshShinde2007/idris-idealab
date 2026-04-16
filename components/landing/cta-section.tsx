import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Users, ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid lg:grid-cols-2">
            {/* Emergency CTA */}
            <div className="border-b border-border p-8 lg:border-b-0 lg:border-r md:p-12">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emergency/10">
                <AlertTriangle className="h-6 w-6 text-emergency" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">Need Help Now?</h3>
              <p className="mb-6 text-muted-foreground">
                If you or someone nearby is in danger, trigger an emergency alert immediately. 
                Help will be dispatched within seconds.
              </p>
              <Link href="/emergency">
                <Button size="lg" className="gap-2 bg-emergency text-emergency-foreground hover:bg-emergency/90">
                  Emergency SOS
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Volunteer CTA */}
            <div className="p-8 md:p-12">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">Want to Help Others?</h3>
              <p className="mb-6 text-muted-foreground">
                Join our network of first responders. Get trained, receive alerts, and save lives in your community.
              </p>
              <Link href="/volunteer">
                <Button size="lg" variant="outline" className="gap-2">
                  Become a Volunteer
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
