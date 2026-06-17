"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface ConnectBoxModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectBoxModal({ open, onOpenChange }: ConnectBoxModalProps) {
  const [boxId, setBoxId] = useState("")
  const [nickname, setNickname] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { connectBox } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const success = await connectBox(boxId.toUpperCase(), nickname)

    if (success) {
      toast({
        title: "Box connected",
        description: `${nickname} is now live.`,
      })
      setBoxId("")
      setNickname("")
      onOpenChange(false)
    } else {
      toast({
        title: "Connection failed",
        description: "This box ID is already connected or invalid.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border shadow-soft-lg max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-foreground">
            Connect an Entolux Box
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="boxId" className="text-foreground">
              Entolux Box ID
            </Label>
            <Input
              id="boxId"
              placeholder="ENT-XXXXXX"
              value={boxId}
              onChange={(e) => setBoxId(e.target.value)}
              className="bg-input border-border focus:ring-primary"
              required
            />
            <p className="text-xs text-muted-foreground">
              Found on the sticker on the base of your box.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-foreground">
              Give this box a name
            </Label>
            <Input
              id="nickname"
              placeholder="e.g. Back garden, Forest zone 2"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="bg-input border-border focus:ring-primary"
              required
            />
            <p className="text-xs text-muted-foreground">
              This is private and only visible to you.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !boxId || !nickname}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Connecting..." : "Connect Box"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
