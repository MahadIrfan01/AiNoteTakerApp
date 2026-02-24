'use client'

/** Custom graphic logo for Noteify – stylized pencil drawing a line (not an emoji). */
interface LogoProps {
  className?: string
  iconClassName?: string
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
}

const sizes = {
  sm: { box: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-lg' },
  md: { box: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-xl' },
  lg: { box: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-3xl' },
}

export default function Logo({ className = '', iconClassName = '', size = 'sm', showWordmark = true }: LogoProps) {
  const s = sizes[size]
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${s.box} bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg flex items-center justify-center shrink-0 shadow-sm`}
        aria-hidden
      >
        <svg
          className={`${s.icon} ${iconClassName}`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          {/* Pencil tip (lead) – black triangle pointing down-right */}
          <path d="M3 21 3 14 10 21Z" fill="#0f172a" />
          {/* Drawn line – thin stroke from tip */}
          <path d="M10 21h11" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
          {/* Pencil body – three diagonal rounded segments (lighter to darker) */}
          <rect x="6" y="2" width="14" height="4" rx="2" transform="rotate(-38 13 4)" fill="url(#pencil-a)" />
          <rect x="8" y="6.5" width="14" height="4" rx="2" transform="rotate(-38 15 8.5)" fill="url(#pencil-b)" />
          <rect x="10" y="11" width="14" height="4" rx="2" transform="rotate(-38 17 13)" fill="url(#pencil-c)" />
          <defs>
            <linearGradient id="pencil-a" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="pencil-b" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="pencil-c" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showWordmark && (
        <span className={`font-bold text-gray-900 dark:text-white truncate ${s.text}`}>
          Noteify
        </span>
      )}
    </div>
  )
}
