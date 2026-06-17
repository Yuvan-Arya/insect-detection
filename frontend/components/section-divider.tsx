import { MothIcon } from "./moth-icon"
import { cn } from "@/lib/utils"

interface SectionDividerProps {
  className?: string
  showIcon?: boolean
}

export function SectionDivider({ className, showIcon = true }: SectionDividerProps) {
  return (
    <div className={cn("relative flex items-center justify-center py-8", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-divider" />
      </div>
      {showIcon && (
        <div className="relative bg-background px-4">
          <MothIcon className="h-5 w-5 text-divider" />
        </div>
      )}
    </div>
  )
}
