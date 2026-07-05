import './Avatar.scss'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Deterministic 1..6 bucket from the name, so a given owner always gets the
// same tint across the app.
function tintIndex(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return (hash % 6) + 1
}

type AvatarProps = {
  name: string
  size?: number
  className?: string
}

export function Avatar({ name, size = 30, className }: AvatarProps) {
  const tint = tintIndex(name)
  return (
    <span
      className={`ko-avatar${className ? ` ${className}` : ''}`}
      data-tint={tint}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}