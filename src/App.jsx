// src/App.jsx
import { useState } from 'react'
import { StoreProvider, useStore } from './store/useStore.jsx'
import Sidebar    from './components/Sidebar.jsx'
import HomeView   from './pages/HomeView.jsx'
import ShelfView  from './pages/ShelfView.jsx'
import ScanView   from './pages/ScanView.jsx'
import StatsView  from './pages/StatsView.jsx'
import AlertsView from './pages/AlertsView.jsx'
import BottomNav  from './components/BottomNav.jsx'

function AppInner() {
  const { view, currentShelf, loading } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:40 }}>📚</div>
      <div style={{ color:'var(--text2)', fontSize:14 }}>Chargement de la bibliothèque…</div>
    </div>
  )

  const renderView = () => {
    switch (view) {
      case 'shelf':  return <ShelfView />
      case 'scan':   return <ScanView />
      case 'stats':  return <StatsView />
      case 'alerts': return <AlertsView />
      default:       return <HomeView onOpenSidebar={() => setSidebarOpen(true)} />
    }
  }

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      {/* Sidebar desktop */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        paddingTop: 'var(--sat)',
      }}>
        <div style={{ flex:1, overflow:'hidden' }}>
          {renderView()}
        </div>
        {/* Bottom nav mobile */}
        <BottomNav />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  )
}
