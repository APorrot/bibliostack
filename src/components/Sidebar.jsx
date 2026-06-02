// src/components/Sidebar.jsx
import { useState } from 'react'
import { useStore } from '../store/useStore.jsx'
import ShelfModal   from './ShelfModal.jsx'
import ProfilePanel from './ProfilePanel.jsx'

export default function Sidebar() {
  const {
    shelves, books, view, setView, setCurrentShelf,
    stats, exportData, sidebarOpen, setSidebarOpen,
    removeShelf, currentProfile, profiles,
  } = useStore()

  const [showShelfModal,   setShowShelfModal]   = useState(false)
  const [showProfiles,     setShowProfiles]     = useState(false)
  const [confirmDeleteId,  setConfirmDeleteId]  = useState(null)

  const navTo = (v, shelf = null) => {
    setView(v)
    setCurrentShelf(shelf)
    setSidebarOpen(false)
  }

  const handleDeleteShelf = (e, id) => {
    e.stopPropagation()
    setConfirmDeleteId(id)
  }

  const confirmDelete = async () => {
    await removeShelf(confirmDeleteId)
    setConfirmDeleteId(null)
  }

  return (
    <>
      {/* ── Overlay mobile ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,.6)',
            zIndex: 98,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: 230,
        flexShrink: 0,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        paddingTop: 'var(--sat)',
        // Mobile : drawer qui slide
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 99,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
        // Desktop (≥768px) : toujours visible
        '@media (min-width: 768px)': { position: 'relative', transform: 'none' },
      }}>

        {/* Logo + profil */}
        <div style={{ padding:'14px 14px 10px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:7, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>📚</div>
              <span style={{ fontWeight:600, fontSize:15, letterSpacing:'-.02em' }}>Bibliostack</span>
            </div>
            {/* Bouton fermer (mobile) */}
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontSize:18, padding:4, lineHeight:1 }}
              aria-label="Fermer le menu"
            >✕</button>
          </div>

          {/* Profil actif */}
          <button
            onClick={() => setShowProfiles(true)}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:8,
              background:'var(--bg3)', border:'1px solid var(--border)',
              borderRadius:8, padding:'7px 10px', cursor:'pointer',
              fontFamily:'var(--font)', transition:'border-color .12s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor='var(--border2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
          >
            <span style={{ fontSize:18 }}>{currentProfile?.emoji || '😊'}</span>
            <span style={{ flex:1, textAlign:'left', fontSize:13, fontWeight:500, color:'var(--text)' }}>{currentProfile?.name || 'Mon profil'}</span>
            <span style={{ fontSize:11, color:'var(--text3)' }}>⇄</span>
          </button>

          {/* Mini stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:4, marginTop:8 }}>
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
                fontSize:13, fontWeight:500, transition:'all .12s',
              }}
              onMouseEnter={e => { if(view!==item.id) e.currentTarget.style.background='var(--bg3)' }}
              onMouseLeave={e => { if(view!==item.id) e.currentTarget.style.background='transparent' }}
            >
              <span style={{ fontSize:16 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}

          {/* Étagères */}
          <div style={{ padding:'10px 16px 4px', fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.08em' }}>
            Étagères
          </div>

          {shelves.map(shelf => {
            const count = books.filter(b => b.shelfId === shelf.id).length
            return (
              <div
                key={shelf.id}
                onClick={() => navTo('shelf', shelf)}
                style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'7px 10px 7px 12px', margin:'1px 8px',
                  borderRadius:8, cursor:'pointer',
                  color:'var(--text2)', fontSize:13, fontWeight:500,
                  transition:'all .12s', position:'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background='var(--bg3)'
                  e.currentTarget.querySelector('.del-btn').style.opacity='1'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background='transparent'
                  e.currentTarget.querySelector('.del-btn').style.opacity='0'
                }}
              >
                <span style={{ fontSize:16 }}>{shelf.emoji}</span>
                <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{shelf.name}</span>
                <span style={{ fontSize:11, color:'var(--text3)', background:'var(--bg3)', padding:'1px 6px', borderRadius:8 }}>{count}</span>
                {/* Bouton supprimer */}
                <button
                  className="del-btn"
                  onClick={(e) => handleDeleteShelf(e, shelf.id)}
                  style={{
                    opacity:0, transition:'opacity .15s',
                    background:'none', border:'none', cursor:'pointer',
                    color:'var(--red)', fontSize:14, padding:'2px 4px',
                    lineHeight:1, borderRadius:4,
                    flexShrink:0,
                  }}
                  title="Supprimer l'étagère"
                >✕</button>
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
              fontFamily:'var(--font)', width:'calc(100% - 16px)',
              transition:'color .12s',
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

      {/* ── Modale confirmation suppression ── */}
      {confirmDeleteId && (() => {
        const shelf = shelves.find(s => s.id === confirmDeleteId)
        const bookCount = books.filter(b => b.shelfId === confirmDeleteId).length
        return (
          <div className="overlay" onClick={() => setConfirmDeleteId(null)}>
            <div className="modal-sheet" style={{ maxWidth:380 }} onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div style={{ padding:'16px 16px 8px', textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>{shelf?.emoji}</div>
                <div style={{ fontWeight:600, fontSize:16, marginBottom:6 }}>Supprimer « {shelf?.name} » ?</div>
                <div style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>
                  Cette action supprimera définitivement l'étagère et ses <strong>{bookCount} livre{bookCount > 1 ? 's' : ''}</strong>.
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn" style={{ flex:1, justifyContent:'center' }} onClick={() => setConfirmDeleteId(null)}>Annuler</button>
                  <button className="btn danger" style={{ flex:1, justifyContent:'center' }} onClick={confirmDelete}>Supprimer</button>
                </div>
              </div>
              <div style={{ height:16 }} />
            </div>
          </div>
        )
      })()}

      {showShelfModal   && <ShelfModal   onClose={() => setShowShelfModal(false)} />}
      {showProfiles     && <ProfilePanel onClose={() => setShowProfiles(false)} />}
    </>
  )
}
