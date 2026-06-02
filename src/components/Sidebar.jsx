// src/components/Sidebar.jsx
import { useState } from 'react'
import { useStore } from '../store/useStore.jsx'
import ShelfModal from './ShelfModal.jsx'

export default function Sidebar({ open, onClose }) {
  const { shelves, books, view, setView, setCurrentShelf, stats, exportData } = useStore()
  const [showShelfModal, setShowShelfModal] = useState(false)

  const navTo = (v, shelf = null) => {
    setView(v)
    setCurrentShelf(shelf)
    onClose()
  }

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:99 }}
          onClick={onClose}
        />
      )}

      <aside style={{
        width: 220,
        flexShrink: 0,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        // Sur mobile : drawer
        position: open ? 'fixed' : 'relative',
        top: 0, left: 0, bottom: 0,
        zIndex: open ? 100 : 'auto',
        transform: open ? 'translateX(0)' : undefined,
        paddingTop: 'var(--sat)',
      }}>
        {/* Logo */}
        <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>📚</div>
            <span style={{ fontWeight:600, fontSize:16, letterSpacing:'-.02em' }}>Bibliostack</span>
          </div>
          {/* Mini stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:4 }}>
            {[['total','livres'],['read','lus'],['series','séries']].map(([k,l]) => (
              <div key={k} style={{ background:'var(--bg3)', borderRadius:6, padding:'5px 6px', textAlign:'center' }}>
                <div style={{ fontWeight:600, fontSize:14 }}>{stats[k]}</div>
                <div style={{ fontSize:9, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
          {[
            { id:'home',   icon:'⌂', label:'Accueil' },
            { id:'stats',  icon:'◎', label:'Statistiques' },
            { id:'alerts', icon:'◉', label:'Alertes sorties' },
            { id:'scan',   icon:'⊕', label:'Ajouter un livre' },
          ].map(item => (
            <div
              key={item.id}
              onClick={() => navTo(item.id)}
              style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'8px 12px', margin:'1px 8px',
                borderRadius:8, cursor:'pointer',
                background: view === item.id ? 'rgba(123,110,246,.15)' : 'transparent',
                color: view === item.id ? 'var(--accent2)' : 'var(--text2)',
                fontSize: 13, fontWeight: 500,
                transition:'all .12s',
              }}
            >
              <span style={{ fontSize:16 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}

          {/* Séparateur étagères */}
          <div style={{ padding:'10px 16px 4px', fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.08em' }}>
            Étagères
          </div>

          {shelves.map(shelf => {
            const count = books.filter(b => b.shelfId === shelf.id).length
            const active = view === 'shelf' /* && currentShelf?.id === shelf.id */
            return (
              <div
                key={shelf.id}
                onClick={() => navTo('shelf', shelf)}
                style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'7px 12px', margin:'1px 8px',
                  borderRadius:8, cursor:'pointer',
                  background: 'transparent',
                  color:'var(--text2)', fontSize:13, fontWeight:500,
                  transition:'all .12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <span style={{ fontSize:16 }}>{shelf.emoji}</span>
                <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{shelf.name}</span>
                <span style={{ fontSize:11, color:'var(--text3)', background:'var(--bg3)', padding:'1px 6px', borderRadius:8 }}>{count}</span>
              </div>
            )
          })}

          {/* Nouvelle étagère */}
          <button
            onClick={() => setShowShelfModal(true)}
            style={{
              display:'flex', alignItems:'center', gap:8,
              padding:'7px 12px', margin:'1px 8px',
              borderRadius:8, cursor:'pointer',
              background:'transparent', border:'none',
              color:'var(--text3)', fontSize:13, fontWeight:500,
              fontFamily:'var(--font)',
              width:'calc(100% - 16px)',
              transition:'all .12s',
            }}
            onMouseEnter={e => e.currentTarget.style.color='var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}
          >
            <span style={{ fontSize:16 }}>＋</span> Nouvelle étagère
          </button>
        </div>

        {/* Footer */}
        <div style={{ padding:'10px 8px', borderTop:'1px solid var(--border)' }}>
          <button className="btn ghost" style={{ width:'100%', justifyContent:'center', fontSize:12 }} onClick={exportData}>
            ↓ Exporter JSON
          </button>
        </div>
      </aside>

      {showShelfModal && <ShelfModal onClose={() => setShowShelfModal(false)} />}
    </>
  )
}
