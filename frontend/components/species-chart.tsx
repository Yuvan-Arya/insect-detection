"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { useAuth } from "@/lib/auth-context"

interface SpeciesChartProps {
  boxFilter?: string | "all"
}

export function SpeciesChart({ boxFilter = "all" }: SpeciesChartProps) {
  const { captures } = useAuth()

  // Filter captures by box first if filter is set
  const filtered = boxFilter === "all" 
    ? captures 
    : captures.filter((c) => c.boxId === boxFilter)

  // Compute species frequencies
  const countsMap: Record<string, number> = {}
  for (const c of filtered) {
    countsMap[c.commonName] = (countsMap[c.commonName] || 0) + 1
  }

  // Sort and take top 8
  const data = Object.entries(countsMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fill: "#6B5744", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Bar
            dataKey="count"
            radius={[0, 4, 4, 0]}
            animationDuration={600}
            animationEasing="ease-out"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill="#228B22" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-badge text-foreground">
          {Object.keys(countsMap).length} unique species identified this month
        </span>
      </div>
    </div>
  )
}
