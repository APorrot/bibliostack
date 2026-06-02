// src/pages/AddBookModal.jsx
import { useState } from 'react'
import { useStore } from '../store/useStore.jsx'

export default function AddBookModal({ prefill = {}, onClose }) {
  const { shelves, addBook } = useStore()
  const [title,   setTitle]   = useState(prefill.title   || '')
  const [author,  setAuthor]  = useState(prefill.author  || '')
  const [year,    setYear]    = useState(prefill.year    || '')
  const [type,    setType]    = useState(prefill.type    || 'novel')
  const [shelfId, setShelfId] = useState(shelves[0]?.id || '')
  const [series,  setSeries]  = useState(prefill.series  || '')
  const [isbn,    setIsbn]    = useState(prefill.isbn    || '')
  const [inducks, setInducks] = useState(prefill.inducks || '')
  const [status,  setStatus]  = useState('unread')
  const [note,    setNote]    = useState('')

  const EMOJI_MAP = { disney:'🦆', manga:'⛩️', novel:'📖', comic:'💥', mixed:'📚' }

  const save = async () => {
    if (!title.trim()) return
    await addBook({
      id:        `book-${Date.now()}`,
      shelfId,
      title:     title.trim(),
      author:    author.trim(),
      year:      parseInt(year) || null,
      type,
      emoji:     EMOJI_MAP[type] || '📖',
      series:    series.trim() || null,
      volume:    null,
      status,
      rating:    0,
      note,
      isbn:      isbn.trim(),
      inducks:   inducks.trim(),
      coverUrl:  prefill.coverUrl || null,
      volumes:   prefill.volumes || null,
      createdAt: Date.now(),
    })
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        {prefill.source && (
          <div style={{
            margin:'10px 16px 0',
            background:'rgba(74,222,128,.07)',
            border:'1px solid rgba(74,222,128,.2)',
            borderRadius:8,
            padding:'8px 10px',
            fontSize:12,
            color:'#4ade80',
          }}>
            ✓ Trouvé sur <strong>{prefill.source}</strong>
          </div>
        )}
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4 }}>
          <span style={{ fontWeight:600 }}>Ajouter à la collection</span>
          <button className="btn ghost icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
          <div>
            <label>Titre *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} autoFocus={!title} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <label>Auteur</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} />
            </div>
            <div>
              <label>Année</label>
              <input value={year} onChange={e => setYear(e.target.value)} type="number" min="1900" max="2030" />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <label>Type</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="disney">🦆 BD Disney</option>
                <option value="manga">⛩️ Manga</option>
                <option value="novel">📖 Roman</option>
                <option value="comic">💥 BD/Comics</option>
              </select>
            </div>
            <div>
              <label>Étagère</label>
              <select value={shelfId} onChange={e => setShelfId(e.target.value)}>
                {shelves.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <label>Série</label>
              <input value={series} onChange={e => setSeries(e.target.value)} placeholder="ex: One Piece" />
            </div>
            <div>
              <label>Statut</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="unread">Non lu</option>
                <option value="reading">En cours</option>
                <option value="read">Lu</option>
              </select>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <label>ISBN</label>
              <input value={isbn} onChange={e => setIsbn(e.target.value)} placeholder="9782…" />
            </div>
            <div>
              <label>Code INDUCKS</label>
              <input value={inducks} onChange={e => setInducks(e.target.value)} placeholder="fr/JM 2485" />
            </div>
          </div>
          <div>
            <label>Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Commentaire, état de l'ouvrage…" style={{ resize:'vertical' }} />
          </div>
        </div>
        <div style={{ padding:'10px 16px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button className="btn" onClick={onClose}>Annuler</button>
          <button className="btn primary" onClick={save}>Ajouter</button>
        </div>
      </div>
    </div>
  )
}
