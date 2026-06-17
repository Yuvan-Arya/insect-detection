export interface Box {
  id: string
  nickname: string
  isOnline: boolean
  lastSync: string
}

export interface Capture {
  id: string
  commonName: string
  latinName: string
  confidence: number
  boxId: string
  boxNickname: string
  timestamp: string
  date: string
  time: string
  imageUrl: string
}

export interface SpeciesCount {
  name: string
  count: number
}

export const boxes: Box[] = [
  {
    id: "ENT-004821",
    nickname: "Back garden",
    isOnline: true,
    lastSync: "3 min ago",
  },
  {
    id: "ENT-009173",
    nickname: "River meadow plot",
    isOnline: true,
    lastSync: "5 min ago",
  },
]

export const captures: Capture[] = [
  {
    id: "1",
    commonName: "Luna Moth",
    latinName: "Actias luna",
    confidence: 97,
    boxId: "ENT-004821",
    boxNickname: "Back garden",
    timestamp: "2026-04-22T02:14:00",
    date: "Apr 22",
    time: "02:14",
    imageUrl: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "2",
    commonName: "Firefly",
    latinName: "Lampyris noctiluca",
    confidence: 91,
    boxId: "ENT-009173",
    boxNickname: "River meadow plot",
    timestamp: "2026-04-21T23:47:00",
    date: "Apr 21",
    time: "23:47",
    imageUrl: "https://images.unsplash.com/photo-1566159196893-9f3e2f75e269?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "3",
    commonName: "Green Lacewing",
    latinName: "Chrysoperla carnea",
    confidence: 88,
    boxId: "ENT-004821",
    boxNickname: "Back garden",
    timestamp: "2026-04-20T01:33:00",
    date: "Apr 20",
    time: "01:33",
    imageUrl: "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "4",
    commonName: "Atlas Moth",
    latinName: "Attacus atlas",
    confidence: 95,
    boxId: "ENT-009173",
    boxNickname: "River meadow plot",
    timestamp: "2026-04-19T00:58:00",
    date: "Apr 19",
    time: "00:58",
    imageUrl: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "5",
    commonName: "Assassin Bug",
    latinName: "Rhynocoris iracundus",
    confidence: 83,
    boxId: "ENT-004821",
    boxNickname: "Back garden",
    timestamp: "2026-04-18T03:12:00",
    date: "Apr 18",
    time: "03:12",
    imageUrl: "https://images.unsplash.com/photo-1546587348-d12660c30c50?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "6",
    commonName: "Crane Fly",
    latinName: "Tipula paludosa",
    confidence: 79,
    boxId: "ENT-009173",
    boxNickname: "River meadow plot",
    timestamp: "2026-04-17T22:41:00",
    date: "Apr 17",
    time: "22:41",
    imageUrl: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "7",
    commonName: "Rhinoceros Beetle",
    latinName: "Oryctes nasicornis",
    confidence: 92,
    boxId: "ENT-004821",
    boxNickname: "Back garden",
    timestamp: "2026-04-16T01:05:00",
    date: "Apr 16",
    time: "01:05",
    imageUrl: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "8",
    commonName: "Mayfly",
    latinName: "Ephemera danica",
    confidence: 86,
    boxId: "ENT-009173",
    boxNickname: "River meadow plot",
    timestamp: "2026-04-15T23:19:00",
    date: "Apr 15",
    time: "23:19",
    imageUrl: "https://images.unsplash.com/photo-1504208434011-7e7a52ed1c30?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "9",
    commonName: "Click Beetle",
    latinName: "Agriotes lineatus",
    confidence: 81,
    boxId: "ENT-004821",
    boxNickname: "Back garden",
    timestamp: "2026-04-14T02:48:00",
    date: "Apr 14",
    time: "02:48",
    imageUrl: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "10",
    commonName: "Garden Tiger Moth",
    latinName: "Arctia caja",
    confidence: 94,
    boxId: "ENT-009173",
    boxNickname: "River meadow plot",
    timestamp: "2026-04-13T00:33:00",
    date: "Apr 13",
    time: "00:33",
    imageUrl: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "11",
    commonName: "Praying Mantis",
    latinName: "Mantis religiosa",
    confidence: 89,
    boxId: "ENT-004821",
    boxNickname: "Back garden",
    timestamp: "2026-04-12T01:17:00",
    date: "Apr 12",
    time: "01:17",
    imageUrl: "https://images.unsplash.com/photo-1585155770913-5bca09e4ff24?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "12",
    commonName: "June Bug",
    latinName: "Amphimallon solstitiale",
    confidence: 85,
    boxId: "ENT-009173",
    boxNickname: "River meadow plot",
    timestamp: "2026-04-11T23:52:00",
    date: "Apr 11",
    time: "23:52",
    imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop&q=80",
  },
]

export const speciesCounts: SpeciesCount[] = [
  { name: "Luna Moth", count: 14 },
  { name: "Garden Tiger Moth", count: 11 },
  { name: "Atlas Moth", count: 9 },
  { name: "Green Lacewing", count: 8 },
  { name: "Firefly", count: 7 },
  { name: "Rhinoceros Beetle", count: 6 },
  { name: "Praying Mantis", count: 5 },
  { name: "Mayfly", count: 4 },
  { name: "Click Beetle", count: 4 },
  { name: "Assassin Bug", count: 3 },
  { name: "Crane Fly", count: 3 },
  { name: "June Bug", count: 2 },
]

export const globalStats = {
  totalBoxes: 4218,
  totalSightings: 1247503,
  uniqueSpecies: 834,
  countries: 47,
}

export const globalData = [
  { date: "2026-04-20", species: "Luna Moth", latinName: "Actias luna", confidence: 96, region: "United Kingdom", elevation: 120, season: "Spring", boxCount: 34 },
  { date: "2026-04-19", species: "Atlas Moth", latinName: "Attacus atlas", confidence: 94, region: "Japan", elevation: 450, season: "Spring", boxCount: 28 },
  { date: "2026-04-18", species: "Garden Tiger Moth", latinName: "Arctia caja", confidence: 92, region: "Germany", elevation: 280, season: "Spring", boxCount: 41 },
  { date: "2026-04-17", species: "Firefly", latinName: "Lampyris noctiluca", confidence: 89, region: "France", elevation: 95, season: "Spring", boxCount: 56 },
  { date: "2026-04-16", species: "Green Lacewing", latinName: "Chrysoperla carnea", confidence: 87, region: "USA", elevation: 320, season: "Spring", boxCount: 73 },
  { date: "2026-04-15", species: "Rhinoceros Beetle", latinName: "Oryctes nasicornis", confidence: 91, region: "Brazil", elevation: 180, season: "Autumn", boxCount: 19 },
  { date: "2026-04-14", species: "Praying Mantis", latinName: "Mantis religiosa", confidence: 88, region: "United Kingdom", elevation: 85, season: "Spring", boxCount: 25 },
  { date: "2026-04-13", species: "Mayfly", latinName: "Ephemera danica", confidence: 85, region: "Germany", elevation: 150, season: "Spring", boxCount: 38 },
  { date: "2026-04-12", species: "Click Beetle", latinName: "Agriotes lineatus", confidence: 82, region: "France", elevation: 220, season: "Spring", boxCount: 31 },
  { date: "2026-04-11", species: "June Bug", latinName: "Amphimallon solstitiale", confidence: 84, region: "USA", elevation: 410, season: "Spring", boxCount: 47 },
  { date: "2026-04-10", species: "Luna Moth", latinName: "Actias luna", confidence: 95, region: "Japan", elevation: 380, season: "Spring", boxCount: 22 },
  { date: "2026-04-09", species: "Crane Fly", latinName: "Tipula paludosa", confidence: 79, region: "Brazil", elevation: 65, season: "Autumn", boxCount: 15 },
  { date: "2026-04-08", species: "Assassin Bug", latinName: "Rhynocoris iracundus", confidence: 81, region: "United Kingdom", elevation: 140, season: "Spring", boxCount: 29 },
  { date: "2026-04-07", species: "Atlas Moth", latinName: "Attacus atlas", confidence: 93, region: "Germany", elevation: 310, season: "Spring", boxCount: 36 },
  { date: "2026-04-06", species: "Garden Tiger Moth", latinName: "Arctia caja", confidence: 90, region: "France", elevation: 175, season: "Spring", boxCount: 44 },
  { date: "2026-04-05", species: "Firefly", latinName: "Lampyris noctiluca", confidence: 86, region: "USA", elevation: 95, season: "Spring", boxCount: 62 },
  { date: "2026-04-04", species: "Green Lacewing", latinName: "Chrysoperla carnea", confidence: 84, region: "Japan", elevation: 280, season: "Spring", boxCount: 33 },
  { date: "2026-04-03", species: "Rhinoceros Beetle", latinName: "Oryctes nasicornis", confidence: 89, region: "Brazil", elevation: 220, season: "Autumn", boxCount: 21 },
  { date: "2026-04-02", species: "Praying Mantis", latinName: "Mantis religiosa", confidence: 87, region: "United Kingdom", elevation: 105, season: "Spring", boxCount: 27 },
  { date: "2026-04-01", species: "Mayfly", latinName: "Ephemera danica", confidence: 83, region: "Germany", elevation: 130, season: "Spring", boxCount: 42 },
]

export const chatResponses: Record<string, string> = {
  "moth count": "High moth diversity typically indicates a healthy, structurally complex habitat with abundant native flowering plants. Moths are sensitive to habitat degradation, so their presence is a positive ecological signal.",
  "luna moth invasive": "No — Actias luna is native to North America and is considered an indicator of forest health. Its presence suggests mature deciduous woodland nearby.",
  "green lacewing plants": "Lacewings are attracted to plants with high aphid populations — their primary prey. Fennel, dill, and yarrow are particularly effective at drawing them in.",
  "fireflies": "Fireflies are highly sensitive to light pollution and habitat fragmentation. A consistent firefly population suggests low artificial light intrusion and intact grassland.",
  "how entolux identifies": "Each photo is processed by a machine learning model trained on hundreds of thousands of labelled insect images. It returns a species name, taxonomy, and confidence score within seconds of the image being taken.",
  "default": "I can help you understand your insect captures and local ecology. Try asking about specific species, what certain insects indicate about your environment, or how the Entolux system works.",
}

export const ecologicalIndicators = [
  {
    icon: "Leaf",
    title: "Nocturnal Pollinators",
    detected: "Luna Moth, Garden Tiger Moth, Atlas Moth",
    meaning: "Strong pollinator presence — healthy night-blooming flora",
    status: "healthy" as const,
  },
  {
    icon: "Lightbulb",
    title: "Light Pollution",
    detected: "Firefly (River meadow plot)",
    meaning: "Firefly sightings indicate low artificial light intrusion",
    status: "healthy" as const,
  },
  {
    icon: "Bug",
    title: "Natural Pest Control",
    detected: "Green Lacewing, Assassin Bug, Praying Mantis",
    meaning: "Active predatory insect population — reduced need for intervention",
    status: "healthy" as const,
  },
  {
    icon: "Droplets",
    title: "Water Proximity",
    detected: "Crane Fly, Mayfly",
    meaning: "Aquatic-linked species suggest clean nearby water source",
    status: "moderate" as const,
  },
  {
    icon: "Sprout",
    title: "Soil Health",
    detected: "Rhinoceros Beetle, Click Beetle, June Bug",
    meaning: "Scarab and click beetle presence linked to healthy soil biology",
    status: "healthy" as const,
  },
  {
    icon: "Flower2",
    title: "Plant Diversity",
    detected: "High moth species richness",
    meaning: "12 species in 30 days indicates diverse native plant understorey",
    status: "healthy" as const,
  },
]
