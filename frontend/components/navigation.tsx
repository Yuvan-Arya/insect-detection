"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown, Package, User, LogOut, Grid3X3 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { MothIcon } from "./moth-icon"
import { ConnectBoxModal } from "./connect-box-modal"

export function Navigation() {
  const pathname = usePathname()
  const { user, isAuthenticated, signOut, boxes, selectedBox, selectBox } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [connectModalOpen, setConnectModalOpen] = useState(false)

  const publicLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
  ]

  const authLinks = isAuthenticated
    ? [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/history", label: "History" },
        ...(user?.accountType === "researcher"
          ? [{ href: "/global-data", label: "Global Data" }]
          : []),
      ]
    : [...publicLinks, { href: "/auth", label: "Sign In" }]

  const links = isAuthenticated ? authLinks : [...publicLinks, { href: "/auth", label: "Sign In" }]

  const hasBoxes = boxes.length > 0

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-nav border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Left side - Box selector or Logo */}
          <div className="flex items-center gap-4">
            {isAuthenticated && hasBoxes ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-card border-border hover:bg-muted gap-2 text-foreground"
                  >
                    {selectedBox === "all" ? (
                      <>
                        <Grid3X3 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="max-w-[160px] truncate">All Boxes</span>
                      </>
                    ) : selectedBox ? (
                      <>
                        <Package className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="max-w-[160px] truncate">{selectedBox.nickname}</span>
                      </>
                    ) : (
                      <>
                        <Package className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="max-w-[160px] truncate">Select Box</span>
                      </>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 bg-card border-border z-[100]">
                  {boxes.map((box) => (
                    <DropdownMenuItem
                      key={box.id}
                      onClick={() => selectBox(box)}
                      className="flex flex-col items-start gap-0.5 py-3 cursor-pointer hover:bg-muted"
                    >
                      <div className="flex items-center gap-2 w-full">
                        {selectedBox !== "all" && selectedBox?.id === box.id && (
                          <span className="h-2 w-2 rounded-full bg-primary animate-breathe" />
                        )}
                        <span className="font-medium text-foreground">{box.nickname}</span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-4">{box.id}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-divider" />
                  <DropdownMenuItem
                    onClick={() => setConnectModalOpen(true)}
                    className="cursor-pointer hover:bg-muted text-primary"
                  >
                    + Connect another box
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => selectBox("all")}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    View all boxes collectively
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/" className="flex items-center gap-2">
                <MothIcon className="h-6 w-6 text-primary" />
                <span className="font-serif text-xl text-primary font-semibold">Entolux</span>
              </Link>
            )}
          </div>

          {/* Center - Logo when box selector is present */}
          {isAuthenticated && hasBoxes && (
            <Link href="/" className="hidden md:flex items-center gap-2">
              <MothIcon className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl text-primary font-semibold">Entolux</span>
            </Link>
          )}

          {/* Right side - Navigation links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors rounded-md",
                  pathname === link.href
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="ml-2 gap-2 hover:bg-muted"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border z-[100]">
                  <div className="px-3 py-2">
                    <p className="text-sm text-muted-foreground">Hi, {user.name}</p>
                    <span
                      className={cn(
                        "inline-block mt-1 px-2 py-0.5 text-xs rounded-full",
                        user.accountType === "researcher"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {user.accountType === "researcher" ? "Researcher" : "Personal"} Account
                    </span>
                  </div>
                  <DropdownMenuSeparator className="bg-divider" />
                  <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                    <User className="h-4 w-4 mr-2" />
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={signOut}
                    className="cursor-pointer hover:bg-muted text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed top-[60px] left-0 right-0 bg-nav border-b border-border shadow-soft-lg animate-fade-in z-[49]">
            <div className="px-4 py-4 space-y-2">
              {isAuthenticated && hasBoxes && (
                <div className="pb-4 border-b border-divider">
                  <p className="text-xs text-muted-foreground mb-2">Select Box</p>
                  {boxes.map((box) => (
                    <button
                      key={box.id}
                      onClick={() => {
                        selectBox(box)
                        setMobileMenuOpen(false)
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm",
                        selectedBox !== "all" && selectedBox?.id === box.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      {box.nickname}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      selectBox("all")
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted"
                  >
                    View all boxes
                  </button>
                </div>
              )}
              
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm font-medium",
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <div className="pt-4 border-t border-divider">
                    <button
                      onClick={() => {
                        signOut()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-destructive hover:bg-muted"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <ConnectBoxModal open={connectModalOpen} onOpenChange={setConnectModalOpen} />
    </>
  )
}
