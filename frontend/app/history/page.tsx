"use client"

import { useState, useMemo } from "react"
import { Clock, Download, ChevronLeft, ChevronRight, X, Search } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export default function HistoryPage() {
  const { boxes, selectedBox, captures } = useAuth()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [boxFilter, setBoxFilter] = useState<string>("all")
  const [confidenceMin, setConfidenceMin] = useState(0)
  const [timeFilter, setTimeFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  // Filter captures
  const filteredCaptures = useMemo(() => {
    return captures.filter((capture) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!capture.commonName.toLowerCase().includes(query) && 
            !capture.latinName.toLowerCase().includes(query)) {
          return false
        }
      }

      // Box filter
      if (boxFilter !== "all" && capture.boxId !== boxFilter) {
        return false
      }

      // Confidence filter
      if (capture.confidence < confidenceMin) {
        return false
      }

      // Time of night filter
      if (timeFilter !== "all") {
        const hour = parseInt(capture.time.split(":")[0])
        if (timeFilter === "before-midnight" && hour >= 0 && hour < 12) {
          return false
        }
        if (timeFilter === "after-midnight" && (hour >= 12 || hour < 0)) {
          return false
        }
        if (timeFilter === "pre-dawn" && (hour < 3 || hour >= 6)) {
          return false
        }
      }

      return true
    })
  }, [searchQuery, boxFilter, confidenceMin, timeFilter])

  // Pagination
  const totalPages = Math.ceil(filteredCaptures.length / itemsPerPage)
  const paginatedCaptures = filteredCaptures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const clearFilters = () => {
    setSearchQuery("")
    setBoxFilter("all")
    setConfidenceMin(0)
    setTimeFilter("all")
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || boxFilter !== "all" || confidenceMin > 0 || timeFilter !== "all"

  const handleExport = () => {
    const headers = ["Date", "Time", "Common Name", "Latin Name", "Confidence", "Box", "GPS"]
    const rows = filteredCaptures.map((c) => [
      c.date,
      c.time,
      c.commonName,
      c.latinName,
      `${c.confidence}%`,
      c.boxNickname,
      "51.5074, -0.1278" // Mock GPS
    ])
    
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "entolux-captures.csv"
    a.click()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-[76px] md:pt-[84px] px-4 pb-4 md:px-8 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl text-foreground">Capture History</h1>
              <p className="text-muted-foreground">
                {filteredCaptures.length} captures found
              </p>
            </div>
            <Button 
              onClick={handleExport}
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/5"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>

          {/* Filter bar */}
          <Card className="mb-8 bg-card border-border sticky top-[76px] z-10">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search species..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10 bg-input border-border focus:ring-primary"
                  />
                </div>

                {/* Box filter */}
                <Select value={boxFilter} onValueChange={(v) => { setBoxFilter(v); setCurrentPage(1) }}>
                  <SelectTrigger className="w-full lg:w-[180px] bg-input border-border">
                    <SelectValue placeholder="All Boxes" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All Boxes</SelectItem>
                    {boxes.map((box) => (
                      <SelectItem key={box.id} value={box.id}>
                        {box.nickname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Confidence filter */}
                <Select 
                  value={confidenceMin.toString()} 
                  onValueChange={(v) => { setConfidenceMin(parseInt(v)); setCurrentPage(1) }}
                >
                  <SelectTrigger className="w-full lg:w-[180px] bg-input border-border">
                    <SelectValue placeholder="Min confidence" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="0">Any confidence</SelectItem>
                    <SelectItem value="70">70%+</SelectItem>
                    <SelectItem value="80">80%+</SelectItem>
                    <SelectItem value="90">90%+</SelectItem>
                  </SelectContent>
                </Select>

                {/* Time filter */}
                <Select value={timeFilter} onValueChange={(v) => { setTimeFilter(v); setCurrentPage(1) }}>
                  <SelectTrigger className="w-full lg:w-[180px] bg-input border-border">
                    <SelectValue placeholder="Time of night" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All night</SelectItem>
                    <SelectItem value="before-midnight">Before midnight</SelectItem>
                    <SelectItem value="after-midnight">After midnight</SelectItem>
                    <SelectItem value="pre-dawn">Pre-dawn (3am-6am)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Photo grid */}
          {paginatedCaptures.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {paginatedCaptures.map((capture, index) => (
                <Card 
                  key={capture.id} 
                  className={`bg-card border-border shadow-soft overflow-hidden animate-slide-up opacity-0 stagger-${(index % 6) + 1}`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={capture.imageUrl}
                      alt={capture.commonName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{capture.commonName}</h3>
                        <p className="font-serif italic text-muted-foreground text-sm">
                          {capture.latinName}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary flex-shrink-0">
                        {capture.confidence}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {capture.date} · {capture.time}
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-badge text-foreground">
                        {capture.boxNickname}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No captures match your filters.</p>
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="mt-4 text-primary"
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-border"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    page === currentPage
                      ? "bg-primary text-primary-foreground"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-border"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
