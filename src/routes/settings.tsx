import { createFileRoute } from '@tanstack/react-router'
import { Monitor, Moon, Palette, Sun, DollarSign } from 'lucide-react'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { useCurrency } from '../components/CurrencyProvider'
import { Select } from '../components/ui/Select'
import { useTheme } from '../lib/useTheme'
import type { Theme } from '../lib/useTheme'

export const Route = createFileRoute('/settings')({
  head: () => ({
    meta: [{ title: 'Settings — Hearth & Timber Uganda' }],
  }),
  component: SettingsPage,
})

const THEME_LABELS: Record<Theme, string> = {
  light: 'Light — warm ivory tones',
  dark: 'Dark — rich, low-light palette',
  auto: 'System — follows your device setting',
}

function SettingsPage() {
  const { theme } = useTheme()
  const { currency, setCurrency, options } = useCurrency()

  return (
    <main className="page-wrap px-4 py-12">
      <div className="settings-page">
        <header className="settings-page__header">
          <h1 className="settings-page__title">Settings</h1>
          <p className="settings-page__sub">
            Personalise your Hearth &amp; Timber experience.
          </p>
        </header>

        {/* ── Appearance ── */}
        <section className="settings-section">
          <div className="settings-section__head">
            <div className="settings-section__icon">
              <Palette size={18} />
            </div>
            <div>
              <h2 className="settings-section__title">Appearance</h2>
              <p className="settings-section__desc">
                Choose how the store looks on your device.
              </p>
            </div>
          </div>

          <div className="settings-section__body">
            <ThemeSwitcher variant="cards" />
            <p className="settings-active-label">
              {theme === 'light' && <Sun size={13} />}
              {theme === 'dark' && <Moon size={13} />}
              {theme === 'auto' && <Monitor size={13} />}
              {THEME_LABELS[theme]}
            </p>
          </div>
        </section>

        {/* ── Currency ── */}
        <section className="settings-section">
          <div className="settings-section__head">
            <div className="settings-section__icon">
              <DollarSign size={18} />
            </div>
            <div>
              <h2 className="settings-section__title">Display Currency</h2>
              <p className="settings-section__desc">
                Prices are always charged in UGX at checkout. This setting only
                affects how prices are displayed.
              </p>
            </div>
          </div>

          <div className="settings-section__body">
            <Select
              value={currency}
              onValueChange={(v) => setCurrency(v as typeof currency)}
              options={options.map((o) => ({ value: o, label: o }))}
              aria-label="Select display currency"
              triggerClassName="settings-select-trigger"
            />
          </div>
        </section>
      </div>
    </main>
  )
}
