interface LogoProps {
  /** Height in pixels. Width scales proportionally. Default 32. */
  size?: number
  className?: string
}

/**
 * Hearth & Timber mark — house silhouette with a flame.
 * Renders as an inline SVG so it inherits theme transitions.
 */
export default function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
    >
      {/* House body */}
      <path d="M4 15L16 4L28 15V28H4V15Z" fill="#8d4f22" />
      {/* Roof edge */}
      <path
        d="M4 15L16 4L28 15"
        stroke="#c08050"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Door */}
      <rect x="12.5" y="20" width="7" height="8" rx="3.5" fill="#f5ede0" />
      {/* Flame outer */}
      <path
        d="M16 10.5C16 10.5 13 13.5 13 15.8C13 17.6 14.3 19 16 19C17.7 19 19 17.6 19 15.8C19 13.5 16 10.5 16 10.5Z"
        fill="#f5ede0"
      />
      {/* Flame inner */}
      <path
        d="M16 13C16 13 14.5 14.5 14.5 15.8C14.5 16.7 15.2 17.4 16 17.4C16.8 17.4 17.5 16.7 17.5 15.8C17.5 14.5 16 13 16 13Z"
        fill="#e8a060"
      />
    </svg>
  )
}
