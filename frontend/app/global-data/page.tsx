"use client"

import { useState, useMemo } from "react"
import { Download, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Info, X } from "lucide-react"
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

type SortField = "date" | "species" | "confidence" | "region" | "elevation" | "boxCount"
type SortDirection = "asc" | "desc"

export default function GlobalDataPage() {
  const { captures } = useAuth()

  const globalData = useMemo(() => {
    return captures.map((c) => ({
      date: c.date,
      species: c.commonName,
      latinName: c.latinName,
      confidence: c.confidence,
      region: "Global",
      elevation: 50,
      season: "Summer",
      boxCount: 1,
      boxId: c.boxId,
    }))
  }, [captures])

  const globalStats = useMemo(() => {
    const totalSightings = captures.length
    const uniqueSpecies = new Set(captures.map((c) => c.commonName)).size
    const uniqueBoxes = new Set(captures.map((c) => c.boxId)).size
    return {
      totalBoxes: uniqueBoxes || 0,
      totalSightings: totalSightings || 0,
      uniqueSpecies: uniqueSpecies || 0,
      countries: uniqueBoxes ? 1 : 0,
    }
  }, [captures])

  const [searchQuery, setSearchQuery] = useState("")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [seasonFilter, setSeasonFilter] = useState<string>("all")
  const [confidenceMin, setConfidenceMin] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const itemsPerPage = 10

  const regions = [...new Set(globalData.map((d) => d.region))].sort()

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = globalData.filter((item) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!item.species.toLowerCase().includes(query) && 
            !item.latinName.toLowerCase().includes(query)) {
          return false
        }
      }
      if (regionFilter !== "all" && item.region !== regionFilter) return false
      if (seasonFilter !== "all" && item.season !== seasonFilter) return false
      if (item.confidence < confidenceMin) return false
      return true
    })

    // Sort
    data.sort((a, b) => {
      let aVal: string | number = a[sortField]
      let bVal: string | number = b[sortField]
      
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase()
        bVal = (bVal as string).toLowerCase()
      }
      
      if (sortDirection === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

    return data
  }, [searchQuery, regionFilter, seasonFilter, confidenceMin, sortField, sortDirection])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setRegionFilter("all")
    setSeasonFilter("all")
    setConfidenceMin(0)
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || regionFilter !== "all" || seasonFilter !== "all" || confidenceMin > 0

  const handleExportCSV = () => {
    const headers = ["Date", "Species", "Latin Name", "Confidence", "Region", "Elevation", "Season", "Box Count"]
    const rows = filteredData.map((d) => [
      d.date,
      d.species,
      d.latinName,
      `${d.confidence}%`,
      d.region,
      `${d.elevation}m`,
      d.season,
      d.boxCount
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "entolux-global-data.csv"
    a.click()
  }

  const handleExportJSON = () => {
    const json = JSON.stringify(filteredData, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "entolux-global-data.json"
    a.click()
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-[60px] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-foreground">Global Dataset</h1>
            <p className="text-muted-foreground">
              Anonymised sighting records from all active Entolux boxes worldwide.
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total boxes active", value: globalStats.totalBoxes.toLocaleString() },
              { label: "Total sightings recorded", value: globalStats.totalSightings.toLocaleString() },
              { label: "Unique species identified", value: globalStats.uniqueSpecies.toLocaleString() },
              { label: "Countries represented", value: globalStats.countries.toLocaleString() },
            ].map((stat, index) => (
              <Card key={stat.label} className={`bg-card border-border animate-slide-up opacity-0 stagger-${index + 1}`}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl md:text-3xl font-semibold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filter bar */}
          <Card className="mb-6 bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
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

                <Select value={regionFilter} onValueChange={(v) => { setRegionFilter(v); setCurrentPage(1) }}>
                  <SelectTrigger className="w-full lg:w-[180px] bg-input border-border">
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All regions</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={seasonFilter} onValueChange={(v) => { setSeasonFilter(v); setCurrentPage(1) }}>
                  <SelectTrigger className="w-full lg:w-[150px] bg-input border-border">
                    <SelectValue placeholder="All seasons" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All seasons</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                    <SelectItem value="Autumn">Autumn</SelectItem>
                    <SelectItem value="Winter">Winter</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={confidenceMin.toString()} 
                  onValueChange={(v) => { setConfidenceMin(parseInt(v)); setCurrentPage(1) }}
                >
                  <SelectTrigger className="w-full lg:w-[150px] bg-input border-border">
                    <SelectValue placeholder="Min confidence" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="0">Any confidence</SelectItem>
                    <SelectItem value="80">80%+</SelectItem>
                    <SelectItem value="90">90%+</SelectItem>
                  </SelectContent>
                </Select>

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

          {/* Note banner */}
          <Card className="mb-6 border-l-4 border-l-primary bg-card border-border">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                All records in this dataset are anonymised. Precise GPS coordinates are randomised 
                within a 5km radius. No personal data is included.
              </p>
            </CardContent>
          </Card>

          {/* Data table */}
          <Card className="mb-6 bg-card border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {[
                      { field: "date" as const, label: "Date" },
                      { field: "species" as const, label: "Species" },
                      { field: null, label: "Latin Name" },
                      { field: "confidence" as const, label: "Confidence" },
                      { field: "region" as const, label: "Region" },
                      { field: "elevation" as const, label: "Elevation" },
                      { field: null, label: "Season" },
                      { field: "boxCount" as const, label: "Box Count" },
                    ].map((col) => (
                      <th
                        key={col.label}
                        className={cn(
                          "px-4 py-3 text-left text-sm font-medium text-foreground",
                          col.field && "cursor-pointer hover:bg-muted/80"
                        )}
                        onClick={() => col.field && handleSort(col.field)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.field && <SortIcon field={col.field} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr
                      key={`${row.date}-${row.species}-${index}`}
                      className={cn(
                        "border-b border-border",
                        index % 2 === 0 ? "bg-background" : "bg-card"
                      )}
                    >
                      <td className="px-4 py-3 text-sm text-muted-foreground">{row.date}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{row.species}</td>
                      <td className="px-4 py-3 text-sm font-serif italic text-muted-foreground">{row.latinName}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {row.confidence}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{row.region}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{row.elevation}m</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{row.season}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{row.boxCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination and Export */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-border"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage} of {totalPages}
                </span>
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

            {/* Export buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleExportCSV}
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/5"
              >
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
              <Button 
                onClick={handleExportJSON}
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/5"
              >
                <Download className="h-4 w-4 mr-2" />
                Export to JSON
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
