// src/components/ShelfModal.jsx
import { useState } from 'react'
import { useStore } from '../store/useStore.jsx'

const EMOJIS = ['📚','🦆','⚔️','🚀','🔮','🌙','🏰','🌿','💀','🎭','🎪','🌊','🔥','⚓','🦸','🐾','🎵','💾','🌅','🤖','⛩️','💥','👾','🧩']
const TYPES  = [
  { value:'disney', label:'BD Disney' },
  { value:'manga',  label:'Manga' },
  { value:'novel',  label:'Roman' },
  { value:'comic',  label:'BD / Comics' },
  { value:'mixed',  label:'Mixte' },
]

export default function ShelfModal({ shelf = null, onClose }) {
  const { addShelf } = useStore()
  const [name,  setName]  = useState(shelf?.name  || '')
  const [desc,  setDesc]  = useState(shelf?.desc  || '')
  const [emoji, setEmoji] = useState(shelf?.emoji || '📚')
  const [type,  setType]  = useState(shelf?.type  || 'mixed')

  const save = async () => {
    if (!name.trim()) return
    await addShelf({
      id:        shelf?.id || `shelf-${Date.now()}`,
      name:      name.trim(),
      desc:      desc.trim(),
      emoji,
      type,
      createdAt: shelf?.createdAt || Date.now(),
    })
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontWeight:600 }}>{shelf ? 'Modifier' : 'Nouvelle étagère'}</span>
          <button className="btn ghost icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label>Nom</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="ex: Mangas shōnen, Romans SF…" autoFocus />
          </div>
          <div>
            <label>Description</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="ex: Ma collection de SF" />
          </div>
          <div>
            <label>Icône</label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {EMOJIS.map(e => (
                <div
                  key={e}
                  onClick={() => setEmoji(e)}
                  style={{
                    width:36, height:36, borderRadius:8,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:18, cursor:'pointer',
                    border:`1px solid ${emoji===e ? 'var(--accent)' : 'var(--border)'}`,
                    background: emoji===e ? 'rgba(123,110,246,.15)' : 'var(--bg3)',
                    transition:'all .12s',
                  }}
                >
                  {e}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label>Type principal</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ padding:'10px 16px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button className="btn" onClick={onClose}>Annuler</button>
          <button className="btn primary" onClick={save}>
            {shelf ? 'Enregistrer' : 'Créer l\'étagère'}
          </button>
        </div>
      </div>
    </div>
  )
}
