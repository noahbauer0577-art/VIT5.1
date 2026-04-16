// frontend/src/components/ResponsiveNav.jsx
// Mobile-responsive navigation with hamburger menu

import { useState } from 'react'
import { useTheme } from '../ThemeProvider'
import { TRANSITIONS, SHADOWS } from '../theme'

export default function ResponsiveNav({ items, activeId, onNavigate, branding }) {
  const { theme, isDark, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutLeft {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        }
      `}</style>

      {/* Desktop Header */}
      <header style={{
        background: theme.bg.primary,
        borderBottom: `1px solid ${theme.border.light}`,
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: SHADOWS.sm,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {branding || 'VIT Intelligence'}
        </div>

        {/* Desktop Nav */}
        <nav style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}>
          {items.map(group => (
            <div key={group.id} style={{ display: 'flex', gap: 4 }}>
              {group.items?.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    setMobileMenuOpen(false)
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: activeId === item.id ? theme.accent.primary : 'transparent',
                    color: activeId === item.id ? '#fff' : theme.text.secondary,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: `all ${TRANSITIONS.fast}`,
                  }}
                  onMouseEnter={(e) => {
                    if (activeId !== item.id) {
                      e.target.style.background = theme.bg.secondary
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeId !== item.id) {
                      e.target.style.background = 'transparent'
                    }
                  }}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${theme.border.light}`,
              background: theme.bg.secondary,
              cursor: 'pointer',
              fontSize: '1rem',
              transition: `all ${TRANSITIONS.fast}`,
            }}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              '@media (max-width: 768px)': {
                display: 'block',
              },
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: theme.text.primary,
              padding: 8,
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </nav>

        <style>{`
          @media (max-width: 768px) {
            nav { display: none; }
            .mobile-menu-btn { display: block !important; }
          }
        `}</style>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav
          style={{
            position: 'fixed',
            top: 60,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.bg.primary,
            borderRight: `1px solid ${theme.border.light}`,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 99,
            animation: `slideInLeft ${TRANSITIONS.base}`,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          {items.map(group => (
            <div key={group.id}>
              {group.label && (
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: theme.text.tertiary,
                  textTransform: 'uppercase',
                  padding: '12px 8px 8px 8px',
                }}>
                  {group.label}
                </div>
              )}
              {group.items?.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    setMobileMenuOpen(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: activeId === item.id ? theme.accent.primary : 'transparent',
                    color: activeId === item.id ? '#fff' : theme.text.primary,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    transition: `all ${TRANSITIONS.fast}`,
                  }}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      )}

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 98,
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
