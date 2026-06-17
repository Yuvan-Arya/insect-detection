import { cn } from "@/lib/utils"

interface MothIconProps {
  className?: string
}

export function MothIcon({ className }: MothIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-6 w-6", className)}
    >
      <path d="M12 2C12 2 8 6 8 10C8 10 6 8 3 8C3 8 4 12 8 14C8 14 6 16 6 20C6 20 9 18 12 18C15 18 18 20 18 20C18 16 16 14 16 14C20 12 21 8 21 8C18 8 16 10 16 10C16 6 12 2 12 2Z" />
      <circle cx="10" cy="10" r="1" />
      <circle cx="14" cy="10" r="1" />
      <path d="M12 6V4M10 5L9 3M14 5L15 3" strokeWidth="0.5" stroke="currentColor" fill="none" />
    </svg>
  )
}

export function MothSilhouette({ className }: MothIconProps) {
  return (
    <svg
      viewBox="0 0 100 60"
      fill="currentColor"
      className={cn("h-12 w-20", className)}
    >
      <path
        d="M50 5
           C50 5 35 15 30 25
           C25 35 15 35 5 30
           C5 30 10 45 25 45
           C25 45 20 55 25 60
           C30 55 40 50 50 50
           C60 50 70 55 75 60
           C80 55 75 45 75 45
           C90 45 95 30 95 30
           C85 35 75 35 70 25
           C65 15 50 5 50 5Z"
        fillRule="evenodd"
      />
      <ellipse cx="40" cy="28" rx="4" ry="6" opacity="0.3" />
      <ellipse cx="60" cy="28" rx="4" ry="6" opacity="0.3" />
      <path d="M50 10L48 2M50 10L52 2M50 10L50 3" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  )
}
