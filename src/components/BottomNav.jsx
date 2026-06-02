// src/components/BottomNav.jsx
import { useStore } from '../store/useStore.jsx'

const ITEMS = [
  { id: 'home',   icon: '⌂',  label: 'Accueil' },
  { id: 'scan',   icon: '⊕',  label: 'Ajouter' },
  { id: 'stats',  icon: '◎',  label: 'Stats' },
  { id: 'alerts', icon: '◉',  label: 'Alertes' },
]

export default function BottomNav() {
  const { view, setView, sidebarOpen, setSidebarOpen } = useStore()

  return (
    <nav style={{
      display: 'flex',
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      paddingBottom: 'var(--sab)',
    }}>
      {/* Bouton hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          padding: '10px 4px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: sidebarOpen ? 'var(--accent2)' : 'var(--text3)',
          fontSize: 20,
          fontFamily: 'var(--font)',
          transition: 'color .15s',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ fontSize:18, lineHeight:1 }}>☰</span>
        <span style={{ fontSize: 10, fontWeight: 500 }}>Menu</span>
      </button>

      {ITEMS.map(item => {
        const active = view === item.id || (item.id === 'home' && view === 'shelf')
        return (
          <button
            key={item.id}
            onClick={() => { setView(item.id); setSidebarOpen(false) }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '10px 4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active ? 'var(--accent2)' : 'var(--text3)',
              fontSize: 20,
              fontFamily: 'var(--font)',
              transition: 'color .15s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
