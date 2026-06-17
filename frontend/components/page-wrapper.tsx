"use client"

import { Navigation } from "./navigation"

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <>
      <Navigation />
      <main className={`pt-[60px] ${className || ""}`}>
        {children}
      </main>
    </>
  )
}
