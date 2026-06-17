"use client"

import Link from "next/link"
import { Sun, Camera, Cpu, ArrowRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { MothSilhouette } from "@/components/moth-icon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { captures } from "@/lib/mock-data"

export default function HomePage() {
  const sampleCaptures = captures.slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-[60px]">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 px-4">
          {/* Drifting moth background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <MothSilhouette className="absolute top-1/3 -left-20 h-24 w-40 text-primary/[0.08] animate-moth-drift" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight text-balance">
              Every insect tells a story about your environment
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Entolux is a solar-powered field unit that works through the night — 
              attracting, photographing, and identifying the insects around you. Automatically.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 transition-all">
                <Link href="/auth">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/5 hover:-translate-y-0.5 transition-all">
                <Link href="/about">
                  How It Works
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 px-4 bg-card">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Sun,
                  step: "1",
                  title: "Attract",
                  description: "UV-A LEDs and a floral scent lure bring insects in from the surrounding area.",
                },
                {
                  icon: Camera,
                  step: "2",
                  title: "Capture",
                  description: "A PIR sensor triggers a 12MP macro camera the moment an insect enters the chamber.",
                },
                {
                  icon: Cpu,
                  step: "3",
                  title: "Identify",
                  description: "An on-device ML model returns a species name, taxonomy, and confidence score within seconds.",
                },
              ].map((item, index) => (
                <Card 
                  key={item.step} 
                  className={`bg-background border-border shadow-soft hover:shadow-soft-lg transition-shadow animate-slide-up opacity-0 stagger-${index + 1}`}
                >
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-sm font-medium text-primary mb-2">{item.step}.</div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Sample Captures Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground text-center mb-4">
              What your box might find tonight
            </h2>
            <p className="text-muted-foreground text-center mb-12">
              Real specimens captured by Entolux boxes around the world
            </p>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {sampleCaptures.map((capture, index) => (
                <Card 
                  key={capture.id} 
                  className={`flex-shrink-0 w-[280px] bg-card border-border shadow-soft overflow-hidden animate-slide-up opacity-0 stagger-${index + 1}`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={capture.imageUrl}
                      alt={capture.commonName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground">{capture.commonName}</h3>
                    <p className="font-serif italic text-muted-foreground text-sm">{capture.latinName}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {capture.confidence}%
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-badge text-foreground">
                        {capture.boxNickname}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why It Matters Section */}
        <section className="py-16 md:py-24 px-4 bg-card">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-8">
              Insects are vanishing. Most of it goes unrecorded.
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground text-pretty">
              <p>
                Insect populations have declined by more than 40% globally in the past three decades. 
                Most of this collapse happens in the dark, in fields and hedgerows, entirely uncounted.
              </p>
              <p>
                Entolux turns every garden, farm, and nature reserve into a monitoring station — 
                and connects your captures to a global dataset used by ecologists and researchers worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 md:py-20 px-4 bg-primary">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-primary-foreground mb-8">
              Ready to start monitoring?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:-translate-y-0.5 transition-all">
                <Link href="/auth">Create an Account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 hover:-translate-y-0.5 transition-all">
                <Link href="/about">Learn More about the box</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border">
          <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Entolux. Documenting the insect world, autonomously.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
