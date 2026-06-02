// src/pages/ShelfView.jsx
import { useState } from 'react'
import { useStore } from '../store/useStore.jsx'
import BookCard   from '../components/BookCard.jsx'
import BookDetail from '../components/BookDetail.jsx'
import { STATUS_META } from '../lib/api.js'

export default function ShelfView() {
  const { currentShelf, books, setView } = useStore()
  const [statusFilter, setStatusFilter] = useState('all')
  const [detail, setDetail] = useState(null)

  if (!currentShelf) { setView('home'); return null }

  const allBooks = books.filter(b => b.shelfId === currentShelf.id)
  const filtered = statusFilter === 'all' ? allBooks : allBooks.filter(b => b.status === statusFilter)

  // Séries avec volumes (vue liste enrichie pour les mangas)
  const hasSeries = allBooks.some(b => b.volumes)

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'16px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
        <button className="btn ghost sm" onClick={() => setView('home')}>← Retour</button>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <span style={{ fontSize:28 }}>{currentShelf.emoji}</span>
        <div>
          <h2 style={{ marginBottom:2 }}>{currentShelf.name}</h2>
          <div style={{ fontSize:12, color:'var(--text2)' }}>{currentShelf.desc} · {allBooks.length} livre{allBooks.length > 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Filtres statut */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
        <button className={`btn sm ${statusFilter==='all'?'primary':''}`} onClick={() => setStatusFilter('all')}>
          Tous ({allBooks.length})
        </button>
        {Object.entries(STATUS_META).map(([k, v]) => (
          <button
            key={k}
            className="btn sm"
            onClick={() => setStatusFilter(k)}
            style={{
              background: statusFilter === k ? v.bg + '33' : 'var(--bg2)',
              color: statusFilter === k ? v.color : 'var(--text2)',
              borderColor: statusFilter === k ? v.color + '55' : 'var(--border)',
            }}
          >
            {k === 'read' ? '✓' : k === 'reading' ? '▶' : '○'} {v.label} ({allBooks.filter(b=>b.status===k).length})
          </button>
        ))}
      </div>

      {/* Vue série (mangas avec tomes) */}
      {hasSeries ? (
        <SeriesView books={filtered} onOpenDetail={setDetail} />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:10 }}>
          {filtered.map(b => <BookCard key={b.id} book={b} onClick={() => setDetail(b)} />)}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text2)', fontSize:13 }}>
          Aucun livre dans cette catégorie.
        </div>
      )}

      {detail && <BookDetail book={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

function SeriesView({ books, onOpenDetail }) {
  // Grouper par série
  const map = {}
  books.forEach(b => {
    const key = b.series || b.id
    if (!map[key]) map[key] = []
    map[key].push(b)
  })

  const volColors  = { read:'#4ade80', reading:'#f5c842', unread:'#2a2a3a', missing:'transparent' }
  const volBorders = { read:'#4ade80', reading:'#f5c842', unread:'#3a3a50', missing:'#3a3a50' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {Object.entries(map).map(([key, items]) => {
        const b = items[0]
        const vols = b.volumes
        const read  = vols ? vols.filter(v => v.s === 'read').length : 0
        const total = vols ? vols.filter(v => v.s !== 'missing').length : 0
        return (
          <div
            key={key}
            style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:12, cursor:'pointer' }}
            onClick={() => onOpenDetail(b)}
          >
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: vols ? 8 : 0 }}>
              <div style={{
                width:36, height:52, borderRadius:6, flexShrink:0,
                background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center',
                overflow:'hidden',
              }}>
                {b.coverUrl
                  ? <img src={b.coverUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ fontSize:20, opacity:.5 }}>{b.emoji}</span>
                }
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:500, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.series || b.title}</div>
                <div style={{ fontSize:12, color:'var(--text2)', marginBottom:4 }}>
                  {b.author} · {vols ? `${read}/${total} tomes` : '1 volume'}
                </div>
                {b.rating > 0 && (
                  <div style={{ display:'flex', gap:1 }}>
                    {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize:11, color: n <= b.rating ? 'var(--yellow)' : 'var(--bg4)' }}>★</span>)}
                  </div>
                )}
              </div>
              {vols && (
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:12, color:'var(--text2)', marginBottom:2 }}>{Math.round(read/total*100)}%</div>
                </div>
              )}
            </div>
            {vols && (
              <>
                <div style={{ background:'var(--bg4)', borderRadius:2, height:3, overflow:'hidden', marginBottom:6 }}>
                  <div style={{ width:`${Math.round(read/total*100)}%`, height:'100%', background:'var(--accent)', borderRadius:2, transition:'width .4s' }} />
                </div>
                <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                  {vols.map(v => (
                    <div key={v.n} style={{
                      width:26, height:26, borderRadius:5,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:9, fontWeight:500,
                      background: volColors[v.s],
                      border: `1px ${v.s==='missing'?'dashed':'solid'} ${volBorders[v.s]}`,
                      color: v.s === 'read' || v.s === 'reading' ? '#0f0f17' : 'var(--text3)',
                    }}>
                      {v.n}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
