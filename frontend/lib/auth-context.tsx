"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { boxes as initialBoxes, type Box, type Capture } from "./mock-data"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export type AccountType = "personal" | "researcher"

export interface User {
  id: string
  name: string
  email: string
  accountType: AccountType
  institution?: string
  researchFocus?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (userData: Partial<User> & { password: string }) => Promise<boolean>
  signOut: () => void
  boxes: Box[]
  selectedBox: Box | "all" | null
  selectBox: (box: Box | "all" | null) => void
  connectBox: (boxId: string, nickname: string) => Promise<boolean>
  captures: Capture[]
  isLoadingCaptures: boolean
  refreshCaptures: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [boxes, setBoxes] = useState<Box[]>(initialBoxes)
  const [selectedBox, setSelectedBox] = useState<Box | "all" | null>("all")
  const [captures, setCaptures] = useState<Capture[]>([])
  const [isLoadingCaptures, setIsLoadingCaptures] = useState(false)

  // Sync default selectedBox once boxes are initialized/loaded
  useEffect(() => {
    if (boxes.length > 0 && selectedBox === "all") {
      // Keep "all" or select the first one depending on preference. Here we default to "all"
    }
  }, [boxes])

  const refreshCaptures = async () => {
    setIsLoadingCaptures(true)
    try {
      const res = await fetch(`${API_BASE}/everything`)
      if (res.ok) {
        const json = await res.json()
        const data = json.data || []
        
        const mapped: Capture[] = data.map((item: any) => {
          return {
            id: item.id,
            commonName: item.name,
            latinName: item.species || item.genus || "Unknown",
            confidence: item.confidence_score,
            boxId: item.box_id,
            boxNickname: item.box_id,
            timestamp: new Date().toISOString(),
            date: "Today",
            time: "02:14",
            imageUrl: item.image_string || "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop&q=80"
          }
        })

        // Extract unique boxes from captures database records
        const uniqueBoxIds = Array.from(new Set(data.map((item: any) => item.box_id))) as string[]
        setBoxes((prev) => {
          const updated = [...prev]
          for (const bid of uniqueBoxIds) {
            if (!updated.some((b) => b.id === bid)) {
              updated.push({
                id: bid,
                nickname: `Box ${bid}`,
                isOnline: true,
                lastSync: "Just now"
              })
            }
          }
          return updated
        })

        setCaptures(mapped)
      }
    } catch (err) {
      console.error("Failed to fetch captures:", err)
    } finally {
      setIsLoadingCaptures(false)
    }
  }

  useEffect(() => {
    if (user) {
      refreshCaptures()
    } else {
      setCaptures([])
    }
  }, [user])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        throw new Error("Invalid email or password")
      }
      const data = await res.json()
      if (res.status === 200 && data.id) {
        setUser({
          id: data.id,
          name: email.split("@")[0]!.replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          email,
          accountType: data.user_type === "researcher" ? "researcher" : "personal"
        })
        return true
      } else {
        throw new Error(data.msg || "Invalid credentials")
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const signUp = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          user_type: userData.accountType || "personal",
          box_id: "" // backend signup body requirement
        })
      })
      if (!res.ok) {
        throw new Error("Failed to create account")
      }
      const data = await res.json()
      if (res.status === 200 && data.id) {
        setUser({
          id: data.id,
          name: userData.name || userData.email!.split("@")[0]!.replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          email: userData.email || "",
          accountType: userData.accountType || "personal",
          institution: userData.institution,
          researchFocus: userData.researchFocus,
        })
        return true
      } else {
        throw new Error(data.msg || "Sign up failed")
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const signOut = () => {
    setUser(null)
  }

  const selectBox = (box: Box | "all" | null) => {
    setSelectedBox(box)
  }

  const connectBox = async (boxId: string, nickname: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/add_box`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ box_name: nickname, box_id: boxId })
      })
      if (!res.ok) {
        throw new Error(`Box registration failed with status ${res.status}`)
      }
      
      const newBox: Box = {
        id: boxId,
        nickname,
        isOnline: true,
        lastSync: "Just now",
      }
      
      setBoxes((prev) => {
        if (prev.some((b) => b.id === boxId)) return prev
        return [...prev, newBox]
      })
      setSelectedBox(newBox)
      await refreshCaptures()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        boxes,
        selectedBox,
        selectBox,
        connectBox,
        captures,
        isLoadingCaptures,
        refreshCaptures,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
