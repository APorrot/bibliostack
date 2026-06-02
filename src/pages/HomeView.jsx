// src/pages/HomeView.jsx
import { useState } from 'react'
import { useStore } from '../store/useStore.jsx'
import BookCard   from '../components/BookCard.jsx'
import BookDetail from '../components/BookDetail.jsx'

export default function HomeView() {
  const { shelves, books, setView, setCurrentShelf } = useStore()
  const [detail, setDetail] = useState(null)

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'16px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <h1>Ma bibliothèque</h1>
        <button className="btn primary sm" onClick={() => setView('scan')}>＋ Ajouter</button>
      </div>

      {shelves.map(shelf => {
        const items = books.filter(b => b.shelfId === shelf.id).slice(0, 6)
        if (!items.length) return null
        return (
          <div key={shelf.id} style={{ marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ fontSize:18 }}>{shelf.emoji}</span>
                <span style={{ fontWeight:600, fontSize:14 }}>{shelf.name}</span>
                <span style={{ fontSize:12, color:'var(--text3)' }}>
                  {books.filter(b => b.shelfId === shelf.id).length} livres
                </span>
              </div>
              <button
                className="btn ghost sm"
                onClick={() => { setCurrentShelf(shelf); setView('shelf') }}
              >
                Voir tout →
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:10 }}>
              {items.map(b => <BookCard key={b.id} book={b} onClick={() => setDetail(b)} />)}
            </div>
          </div>
        )
      })}

      {books.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 16px', color:'var(--text2)' }}>
          <div style={{ fontSize:48, marginBottom:12, opacity:.3 }}>📚</div>
          <div style={{ fontSize:16, fontWeight:500, color:'var(--text)', marginBottom:6 }}>Collection vide</div>
          <div style={{ fontSize:13, marginBottom:16 }}>Ajoutez votre premier livre pour commencer</div>
          <button className="btn primary" onClick={() => setView('scan')}>＋ Ajouter un livre</button>
        </div>
      )}

      {detail && <BookDetail book={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
