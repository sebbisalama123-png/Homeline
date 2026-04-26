import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../lib/useTheme'
import type { Theme } from '../lib/useTheme'

const OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'auto', icon: Monitor, label: 'System' },
]

interface ThemeSwitcherProps {
  /** 'pill' = compact segmented control (header), 'cards' = large tiles (settings page) */
  variant?: 'pill' | 'cards'
}

export function ThemeSwitcher({ variant = 'pill' }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()

  if (variant === 'cards') {
    return (
      <div className="theme-cards">
        {OPTIONS.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={`theme-card ${theme === value ? 'is-active' : ''}`}
            aria-pressed={theme === value}
          >
            <div
              className={`theme-card__preview theme-card__preview--${value}`}
            >
              <div
                className={`theme-card__swatch theme-card__swatch--${value}`}
              />
            </div>
            <div className="theme-card__icon">
              <Icon size={16} />
            </div>
            <span className="theme-card__label">{label}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="theme-pill" role="group" aria-label="Select theme">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={`theme-pill__btn ${theme === value ? 'is-active' : ''}`}
          aria-pressed={theme === value}
          title={label}
        >
          <Icon size={14} />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  )
}
