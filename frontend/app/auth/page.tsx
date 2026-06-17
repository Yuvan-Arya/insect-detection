"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bug, Microscope } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth, type AccountType } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

type AuthMode = "signin" | "signup"

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()
  
  const [mode, setMode] = useState<AuthMode>("signup")
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [institution, setInstitution] = useState("")
  const [researchFocus, setResearchFocus] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signIn(email, password)
      router.push("/dashboard")
    } catch {
      setError("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!accountType) {
      setError("Please select an account type")
      return
    }

    setIsLoading(true)

    try {
      await signUp({
        name,
        email,
        password,
        accountType,
        institution: accountType === "researcher" ? institution : undefined,
        researchFocus: accountType === "researcher" ? researchFocus : undefined,
      })
      router.push("/dashboard")
    } catch {
      setError("Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-[60px] py-16 px-4">
        <div className="max-w-[520px] mx-auto">
          <Card className="bg-card border-border shadow-soft-lg animate-fade-in">
            <CardContent className="p-8">
              {/* Tab switcher */}
              <div className="flex mb-8 border-b border-border">
                <button
                  onClick={() => setMode("signup")}
                  className={cn(
                    "flex-1 pb-3 text-sm font-medium transition-colors border-b-2 -mb-[1px]",
                    mode === "signup"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setMode("signin")}
                  className={cn(
                    "flex-1 pb-3 text-sm font-medium transition-colors border-b-2 -mb-[1px]",
                    mode === "signin"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Sign In
                </button>
              </div>

              {mode === "signup" && (
                <>
                  {/* Account type selector */}
                  <div className="mb-8">
                    <h2 className="font-serif text-2xl text-foreground mb-6 text-center">
                      How will you use Entolux?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setAccountType("personal")}
                        className={cn(
                          "p-6 rounded-xl border-2 text-left transition-all hover:-translate-y-0.5",
                          accountType === "personal"
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:border-primary/50"
                        )}
                      >
                        <Bug className="h-8 w-8 text-primary mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">Personal Account</h3>
                        <p className="text-sm text-muted-foreground">
                          For customers who own an Entolux box. Access your own captures and data.
                        </p>
                      </button>
                      <button
                        onClick={() => setAccountType("researcher")}
                        className={cn(
                          "p-6 rounded-xl border-2 text-left transition-all hover:-translate-y-0.5",
                          accountType === "researcher"
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:border-primary/50"
                        )}
                      >
                        <Microscope className="h-8 w-8 text-primary mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">Researcher Account</h3>
                        <p className="text-sm text-muted-foreground">
                          For ecologists, academics, and conservation orgs. Access anonymised data from all boxes globally.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Sign Up Form */}
                  {accountType && (
                    <form onSubmit={handleSignUp} className="space-y-6 animate-fade-in">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-input border-border focus:ring-primary"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-input border-border focus:ring-primary"
                          required
                        />
                      </div>

                      {accountType === "researcher" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="institution">Institution / Organisation</Label>
                            <Input
                              id="institution"
                              value={institution}
                              onChange={(e) => setInstitution(e.target.value)}
                              className="bg-input border-border focus:ring-primary"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="researchFocus">Research focus</Label>
                            <Select value={researchFocus} onValueChange={setResearchFocus}>
                              <SelectTrigger className="bg-input border-border focus:ring-primary">
                                <SelectValue placeholder="Select your research focus" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                <SelectItem value="entomology">Entomology</SelectItem>
                                <SelectItem value="conservation">Conservation Biology</SelectItem>
                                <SelectItem value="agriculture">Agriculture</SelectItem>
                                <SelectItem value="climate">Climate Science</SelectItem>
                                <SelectItem value="citizen">Citizen Science</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-input border-border focus:ring-primary"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-input border-border focus:ring-primary"
                          required
                        />
                      </div>

                      {error && (
                        <p className="text-sm text-destructive">{error}</p>
                      )}

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {isLoading
                          ? "Creating account..."
                          : accountType === "researcher"
                          ? "Apply for Researcher Access"
                          : "Create Personal Account"}
                      </Button>

                      {accountType === "researcher" && (
                        <p className="text-xs text-muted-foreground text-center italic">
                          Researcher accounts are reviewed and approved within 24 hours. 
                          You will receive a confirmation email once your access is granted.
                        </p>
                      )}
                    </form>
                  )}
                </>
              )}

              {mode === "signin" && (
                <form onSubmit={handleSignIn} className="space-y-6">
                  <h2 className="font-serif text-2xl text-foreground mb-6 text-center">
                    Welcome back
                  </h2>

                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email address</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-input border-border focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-input border-border focus:ring-primary"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <p className="text-sm text-center text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="text-primary hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
