"use client"

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  "aria-label": string
  className?: string
}

export function Switch({ checked, onCheckedChange, "aria-label": ariaLabel, className = "" }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-input"
      } ${className}`}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        className={`${
          checked ? "translate-x-6" : "translate-x-1"
        } inline-block h-4 w-4 transform rounded-full bg-background transition-transform`}
      />
    </button>
  )
}
