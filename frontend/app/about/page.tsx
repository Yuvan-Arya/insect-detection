"use client"

import Link from "next/link"
import { Sun, Wind, ArrowDown, Filter, Cpu, Bug, Leaf, Thermometer, Zap, Wifi, Clock } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { SectionDivider } from "@/components/section-divider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MothIcon } from "@/components/moth-icon"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-[60px]">
        <article className="max-w-[720px] mx-auto px-4 py-16 md:py-24">
          {/* Section 1: Hero */}
          <section className="text-center mb-16 animate-fade-in">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
              Meet the Entolux Box
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              A self-contained field unit that documents the insect world — 
              autonomously, accurately, and without harm.
            </p>
            
            {/* Box Diagram */}
            <div className="mt-12 p-8 bg-card rounded-xl border border-border">
              <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto">
                {/* Box body */}
                <rect x="100" y="80" width="200" height="160" rx="8" fill="none" stroke="#228B22" strokeWidth="2" />
                
                {/* Solar panel top */}
                <rect x="120" y="60" width="160" height="20" rx="2" fill="none" stroke="#228B22" strokeWidth="2" />
                <line x1="140" y1="60" x2="140" y2="80" stroke="#228B22" strokeWidth="1" />
                <line x1="180" y1="60" x2="180" y2="80" stroke="#228B22" strokeWidth="1" />
                <line x1="220" y1="60" x2="220" y2="80" stroke="#228B22" strokeWidth="1" />
                <line x1="260" y1="60" x2="260" y2="80" stroke="#228B22" strokeWidth="1" />
                
                {/* UV Ring */}
                <circle cx="200" cy="130" r="30" fill="none" stroke="#228B22" strokeWidth="2" strokeDasharray="4 4" />
                
                {/* Camera lens */}
                <circle cx="200" cy="180" r="15" fill="none" stroke="#228B22" strokeWidth="2" />
                <circle cx="200" cy="180" r="8" fill="none" stroke="#228B22" strokeWidth="1" />
                
                {/* Scent lure */}
                <circle cx="150" cy="210" r="8" fill="none" stroke="#228B22" strokeWidth="2" />
                
                {/* Callout labels */}
                <line x1="200" y1="60" x2="200" y2="30" stroke="#228B22" strokeWidth="1" strokeDasharray="2 2" />
                <text x="200" y="22" textAnchor="middle" className="text-xs fill-primary">Solar Panel</text>
                
                <line x1="240" y1="130" x2="320" y2="100" stroke="#228B22" strokeWidth="1" strokeDasharray="2 2" />
                <text x="330" y="105" className="text-xs fill-primary">UV-A LED Ring</text>
                
                <line x1="220" y1="180" x2="320" y2="180" stroke="#228B22" strokeWidth="1" strokeDasharray="2 2" />
                <text x="330" y="185" className="text-xs fill-primary">12MP Macro Camera</text>
                
                <line x1="150" y1="220" x2="60" y2="250" stroke="#228B22" strokeWidth="1" strokeDasharray="2 2" />
                <text x="60" y="265" className="text-xs fill-primary">Scent Lure Septum</text>
              </svg>
            </div>
          </section>

          <SectionDivider />

          {/* Section 2: How It Attracts */}
          <section className="mb-16 animate-fade-in">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">
              Two signals, one irresistible invitation
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 text-pretty">
              The Entolux box uses two mechanisms working in concert. A ring of UV-A LEDs 
              emitting at 365nm and 395nm exploits insects&apos; natural phototaxis — their hardwired 
              attraction to ultraviolet light. Alongside this, a slow-release rubber septum 
              lure loaded with phenylacetaldehyde, eugenol, and benzyl acetate releases a scent 
              blend that mimics night-blooming flowers, drawing moths, beetles, and flies in 
              from a wide surrounding radius.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sun className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    365nm &amp; 395nm UV-A LEDs — tuned to peak insect sensitivity
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Wind className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Phenylacetaldehyde, Eugenol, Benzyl acetate — a floral mimic lure
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <SectionDivider />

          {/* Section 3: How It Captures */}
          <section className="mb-16 animate-fade-in">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">
              Triggered, sharp, and instant
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 text-pretty">
              Insects enter through a one-way funnel into a sealed imaging chamber. A PIR motion 
              sensor detects their presence and triggers a Raspberry Pi HQ 12-megapixel macro camera, 
              capturing a sharp close-up photograph illuminated by a white LED flash. A perceptual 
              hashing algorithm then filters out duplicate photos of the same individual from the 
              same session, ensuring every record in your history is a unique sighting.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-8">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-card border border-border flex items-center justify-center">
                  <ArrowDown className="h-8 w-8 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground mt-2">Insect enters</span>
              </div>
              <div className="hidden md:block w-12 h-0.5 bg-divider" />
              <div className="md:hidden h-8 w-0.5 bg-divider" />
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-card border border-border flex items-center justify-center">
                  <Cpu className="h-8 w-8 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground mt-2">PIR triggers camera</span>
              </div>
              <div className="hidden md:block w-12 h-0.5 bg-divider" />
              <div className="md:hidden h-8 w-0.5 bg-divider" />
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-card border border-border flex items-center justify-center">
                  <Filter className="h-8 w-8 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground mt-2">Duplicate removed</span>
              </div>
            </div>
          </section>

          <SectionDivider />

          {/* Section 4: How It Identifies */}
          <section className="mb-16 animate-fade-in">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">
              From photograph to species name in seconds
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 text-pretty">
              Each unique image is processed by a machine learning model trained on hundreds 
              of thousands of labelled insect photographs. Within seconds it returns a species 
              name, full taxonomic classification, and a confidence score. The full sighting 
              record — photo, species ID, confidence score, GPS coordinates, and timestamp — 
              is uploaded via 4G to the cloud and appears on your personal dashboard instantly. 
              It is simultaneously contributed to the global researcher dataset.
            </p>
            <Card className="bg-card border-border overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 aspect-[4/3] md:aspect-auto">
                  <img
                    src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop&q=80"
                    alt="Garden Tiger Moth"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6 flex-1">
                  <h3 className="font-semibold text-foreground text-lg">Garden Tiger Moth</h3>
                  <p className="font-serif italic text-muted-foreground">Arctia caja</p>
                  <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    94%
                  </span>
                  <p className="text-sm text-muted-foreground mt-4">
                    Apr 13 · 00:33 · Box: River meadow plot
                  </p>
                </CardContent>
              </div>
            </Card>
          </section>

          <SectionDivider />

          {/* Section 5: Why It Matters */}
          <section className="mb-16 animate-fade-in">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">
              Insects are the measure of a living world
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 text-pretty">
              Insect populations have declined by more than 40% globally over the past three 
              decades. Yet most of this collapse is invisible — it happens in the dark, in 
              fields and forests, uncounted. The Entolux box turns every garden, farm, and 
              nature reserve into a monitoring station.
            </p>
            <div className="grid gap-4">
              {[
                {
                  icon: Bug,
                  species: "Firefly",
                  meaning: "Firefly presence indicates low light pollution and healthy meadow habitat",
                },
                {
                  icon: Leaf,
                  species: "Lacewing",
                  meaning: "Lacewing abundance indicates active natural pest control",
                },
                {
                  icon: MothIcon,
                  species: "Moths",
                  meaning: "High moth species richness indicates diverse native plant community",
                },
              ].map((item, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.species}</p>
                      <p className="text-sm text-muted-foreground">{item.meaning}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* Section 6: Research Contribution */}
          <section className="mb-16 animate-fade-in">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">
              Every capture you make becomes part of something larger
            </h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-pretty">
              <p>
                When you deploy an Entolux box, you are not just monitoring your own patch of 
                land — you are contributing to a global baseline. Every sighting your box uploads 
                is automatically added to the Entolux shared dataset, where it becomes accessible 
                in anonymised form — without your personal details or precise location — to 
                verified researchers around the world.
              </p>
              <p>
                Entomologists studying population collapse, conservation biologists mapping 
                pollinator corridors, and climate scientists tracking phenological shifts all 
                draw on data from boxes like yours. A moth recorded in your back garden might 
                be the data point that confirms a range expansion northward.
              </p>
            </div>

            {/* Flow diagram */}
            <div className="my-12 py-8 px-4 bg-card rounded-xl border border-border">
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <MothIcon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Your Entolux Box</span>
                </div>
                <ArrowDown className="h-6 w-6 text-divider" />
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Sighting uploaded to cloud</span>
                </div>
                <ArrowDown className="h-6 w-6 text-divider" />
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="text-center px-4 py-3 bg-background rounded-lg border border-border">
                    <span className="text-sm font-medium text-foreground">Your personal dashboard</span>
                  </div>
                  <span className="text-muted-foreground">+</span>
                  <div className="text-center px-4 py-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="text-sm font-medium text-primary">Global researcher dataset</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Researcher disciplines */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Bug, field: "Entomology", focus: "Population trends and species range shifts" },
                { icon: Leaf, field: "Conservation Biology", focus: "Pollinator corridor mapping" },
                { icon: Thermometer, field: "Climate Science", focus: "Phenological change indicators" },
              ].map((item, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    <item.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="font-medium text-foreground text-sm">{item.field}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.focus}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="border-l-4 border-primary bg-card p-6 rounded-r-lg">
              <p className="text-muted-foreground italic text-pretty">
                &ldquo;The next major insect dataset will not come from a single institution. 
                It will come from thousands of boxes in thousands of gardens.&rdquo;
              </p>
            </blockquote>
          </section>

          <SectionDivider />

          {/* Section 7: Fully Autonomous */}
          <section className="mb-16 animate-fade-in">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">
              Set it out. Leave it. Come back to data.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 text-pretty">
              The Entolux box is fully weatherproof and solar-powered. It operates autonomously 
              through the night with no wifi required and no manual operation. A timed exit 
              vent at the back releases insects unharmed after each session. The box charges 
              during the day and is ready again by dusk.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Zap, text: "Solar powered · Zero grid dependency" },
                { icon: Wifi, text: "4G upload · No wifi needed" },
                { icon: Clock, text: "Timed release · No harm to insects" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* Section 8: CTA */}
          <section className="text-center animate-fade-in">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-8">
              Ready to start monitoring?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 transition-all">
                <Link href="/auth">Create an Account</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/5 hover:-translate-y-0.5 transition-all">
                <Link href="/dashboard">View Dashboard Demo</Link>
              </Button>
            </div>
          </section>
        </article>

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
