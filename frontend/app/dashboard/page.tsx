"use client"

import { useState } from "react"
import Link from "next/link"
import { Clock, ArrowRight, Leaf, Lightbulb, Bug, Droplets, Sprout, Flower2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useChatbot } from "@/components/chatbot"
import { SpeciesChart } from "@/components/species-chart"
import { ConnectBoxModal } from "@/components/connect-box-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ecologicalIndicators } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Leaf,
  Lightbulb,
  Bug,
  Droplets,
  Sprout,
  Flower2,
}

export default function DashboardPage() {
  const { user, boxes, selectedBox, captures } = useAuth()
  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const { open: openChat } = useChatbot()

  const hasBoxes = boxes.length > 0
  const currentBox = selectedBox === "all" ? null : selectedBox
  const boxName = selectedBox === "all" ? "All Boxes" : currentBox?.nickname || "No box selected"

  // Filter captures based on selected box
  const filteredCaptures = selectedBox === "all" 
    ? captures 
    : captures.filter((c) => c.boxId === currentBox?.id)

  const handleAskAbout = (speciesName: string) => {
    openChat(`Tell me about ${speciesName}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-[60px]">
        <div className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Top bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">
                  {selectedBox === "all" ? "Overview — All Boxes" : boxName}
                </p>
              </div>
              {hasBoxes && currentBox && (
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    currentBox.isOnline ? "bg-success animate-breathe" : "bg-muted-foreground"
                  )} />
                  <span className="text-sm text-muted-foreground">
                    {currentBox.isOnline ? "Live" : "Offline"} · Last sync {currentBox.lastSync}
                  </span>
                </div>
              )}
            </div>

            {/* No boxes banner */}
            {!hasBoxes && (
              <Card className="mb-8 border-l-4 border-l-primary bg-card border-border animate-fade-in">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">No box connected yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your Entolux box to start receiving nightly captures.
                  </p>
                  <Button 
                    onClick={() => setConnectModalOpen(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Connect a Box
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Ecological Summary */}
            {hasBoxes && (
              <Card className="mb-8 border-l-4 border-l-primary bg-card border-border animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-foreground">What your box is telling you</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 text-pretty">
                    High moth activity recorded across both sites over the past week — 
                    particularly Luna Moths and Garden Tiger Moths — indicating strong 
                    nocturnal pollinator presence and a diverse native plant understorey. 
                    Firefly sightings at River meadow plot suggest low light pollution 
                    and healthy grassland habitat. Green Lacewing captures at Back garden 
                    point to active natural pest control in the area.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-success/10 text-success">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      Pollinator Activity — Healthy
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-success/10 text-success">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      Habitat Quality — Good
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-warning/10 text-warning">
                      <span className="h-2 w-2 rounded-full bg-warning" />
                      Light Pollution — Moderate
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Captures */}
            {hasBoxes && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-xl text-foreground">Recent captures</h2>
                  <Link href="/history" className="text-sm text-primary hover:underline flex items-center gap-1">
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                  {filteredCaptures.slice(0, 6).map((capture, index) => (
                    <Card 
                      key={capture.id} 
                      className={`flex-shrink-0 w-[220px] bg-card border-border shadow-soft overflow-hidden animate-slide-up opacity-0 stagger-${index + 1}`}
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={capture.imageUrl}
                          alt={capture.commonName}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-foreground text-sm">{capture.commonName}</h3>
                        <p className="font-serif italic text-muted-foreground text-xs">{capture.latinName}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {capture.confidence}%
                          </span>
                          {selectedBox === "all" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-badge text-foreground">
                              {capture.boxNickname}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {capture.date} · {capture.time}
                        </div>
                        <button
                          onClick={() => handleAskAbout(capture.commonName)}
                          className="mt-2 text-xs text-primary hover:underline"
                        >
                          Ask about this →
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Species Counter */}
            {hasBoxes && (
              <section className="mb-8">
                <h2 className="font-serif text-xl text-foreground mb-4">
                  Species frequency — last 30 days
                </h2>
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <SpeciesChart boxFilter={selectedBox === "all" ? "all" : currentBox?.id} />
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Ecological Indicators */}
            {hasBoxes && (
              <section className="mb-8">
                <h2 className="font-serif text-xl text-foreground mb-4">
                  What your captures indicate
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ecologicalIndicators.map((indicator, index) => {
                    const IconComponent = iconMap[indicator.icon] || Leaf
                    return (
                      <Card 
                        key={indicator.title} 
                        className={`bg-card border-border shadow-soft animate-slide-up opacity-0 stagger-${index + 1}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground text-sm">
                                  {indicator.title}
                                </h3>
                                <span className={cn(
                                  "h-2 w-2 rounded-full",
                                  indicator.status === "healthy" ? "bg-success" : "bg-warning"
                                )} />
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Detected: {indicator.detected}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {indicator.meaning}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <ConnectBoxModal open={connectModalOpen} onOpenChange={setConnectModalOpen} />
    </div>
  )
}
