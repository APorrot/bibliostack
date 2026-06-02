// src/components/BookDetail.jsx
import { useState } from 'react'
import { useStore } from '../store/useStore.jsx'
import { TYPE_META, STATUS_META } from '../lib/api.js'

const VOL_CYCLE = ['unread', 'reading', 'read', 'missing']

export default function BookDetail({ book, onClose }) {
  const { updateBook, removeBook } = useStore()
  const [note, setNote] = useState(book.note || '')
  const [editNote, setEditNote] = useState(false)
  const tm = TYPE_META[book.type] || TYPE_META.novel
  const sm = STATUS_META[book.status]

  const setStatus = (s) => updateBook(book.id, { status: s })
  const setRating = (r) => updateBook(book.id, { rating: r })
  const saveNote  = ()  => { updateBook(book.id, { note }); setEditNote(false) }

  const cycleVol = (n) => {
    const vols = [...book.volumes]
    const v = vols.find(x => x.n === n)
    if (!v) return
    v.s = VOL_CYCLE[(VOL_CYCLE.indexOf(v.s) + 1) % VOL_CYCLE.length]
    updateBook(book.id, { volumes: vols })
  }

  const handleDelete = () => {
    if (confirm(`Retirer "${book.title}" de la collection ?`)) {
      removeBook(book.id)
      onClose()
    }
  }

  const volColors = { read:'#4ade80', reading:'#f5c842', unread:'#2a2a3a', missing:'transparent' }
  const volBorder = { read:'#4ade80', reading:'#f5c842', unread:'#3a3a50', missing:'#3a3a50' }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
          {/* Cover */}
          <div style={{
            width:60, height:88, borderRadius:8,
            background:`linear-gradient(150deg, ${tm.gradient[0]}22, ${tm.gradient[1]}33)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            overflow:'hidden', flexShrink:0,
          }}>
            {book.coverUrl
              ? <img src={book.coverUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <span style={{ fontSize:28, opacity:.5 }}>{book.emoji}</span>
            }
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:600, fontSize:15, lineHeight:1.3, marginBottom:3 }}>{book.title}</div>
            <div style={{ fontSize:13, color:'var(--text2)', marginBottom:6 }}>{book.author}{book.year ? ` · ${book.year}` : ''}</div>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              <span className={`tag ${book.type}`}>{tm.label}</span>
              {book.series && <span className="tag unread">{book.series}</span>}
            </div>
          </div>
          <button className="btn ghost icon" onClick={onClose} style={{ flexShrink:0 }}>✕</button>
        </div>

        <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Status */}
          <div>
            <label>Statut de lecture</label>
            <div style={{ display:'flex', gap:6 }}>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <button
                  key={k}
                  className="btn"
                  onClick={() => setStatus(k)}
                  style={{
                    flex:1, justifyContent:'center',
                    background: book.status === k ? v.bg + '33' : 'var(--bg3)',
                    color: book.status === k ? v.color : 'var(--text2)',
                    borderColor: book.status === k ? v.color + '66' : 'var(--border)',
                    fontSize: 12,
                  }}
                >
                  {k === 'read' ? '✓' : k === 'reading' ? '▶' : '○'} {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label>Note</label>
            <div style={{ display:'flex', gap:4 }}>
              {[1,2,3,4,5].map(n => (
                <span
                  key={n}
                  className={`star ${n > book.rating ? 'off' : ''}`}
                  style={{ fontSize:24 }}
                  onClick={() => setRating(book.rating === n ? 0 : n)}
                >★</span>
              ))}
            </div>
          </div>

          {/* Note perso */}
          <div>
            <label>Commentaire personnel</label>
            {editNote ? (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                  placeholder="Vos impressions, notes, contexte…"
                  style={{ resize:'vertical' }}
                  autoFocus
                />
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn primary sm" onClick={saveNote}>Enregistrer</button>
                  <button className="btn sm" onClick={() => { setNote(book.note||''); setEditNote(false) }}>Annuler</button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setEditNote(true)}
                style={{
                  background:'var(--bg3)', borderRadius:8, padding:10,
                  fontSize:13, lineHeight:1.6, cursor:'text',
                  color: book.note ? 'var(--text)' : 'var(--text3)',
                  border:'1px solid var(--border)',
                  minHeight:40,
                }}
              >
                {book.note || 'Cliquez pour ajouter un commentaire…'}
              </div>
            )}
          </div>

          {/* Volumes pour manga */}
          {book.volumes && (() => {
            const total = book.volumes.filter(v => v.s !== 'missing').length
            const read  = book.volumes.filter(v => v.s === 'read').length
            return (
              <div>
                <label>Tomes — {read}/{total} lus · {Math.round(read/total*100)}%</label>
                <div style={{ background:'var(--bg4)', borderRadius:3, height:4, overflow:'hidden', marginBottom:8 }}>
                  <div style={{ width:`${Math.round(read/total*100)}%`, height:'100%', background:'var(--accent)', borderRadius:3, transition:'width .4s' }} />
                </div>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                  {book.volumes.map(v => (
                    <div
                      key={v.n}
                      onClick={() => cycleVol(v.n)}
                      title={`Tome ${v.n}`}
                      style={{
                        width:30, height:30, borderRadius:6,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:10, fontWeight:500,
                        background: volColors[v.s],
                        border: `1px ${v.s === 'missing' ? 'dashed' : 'solid'} ${volBorder[v.s]}`,
                        color: v.s === 'missing' ? 'var(--text3)' : v.s === 'unread' ? 'var(--text3)' : '#0f0f17',
                        cursor: 'pointer',
                        transition: 'transform .1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform='scale(1.15)'}
                      onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                    >
                      {v.n}
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:10, marginTop:6, fontSize:10, color:'var(--text3)' }}>
                  {[['#4ade80','Lu'],['#f5c842','En cours'],['#2a2a3a','Non lu'],['transparent','Manquant']].map(([c,l]) => (
                    <span key={l} style={{ display:'flex', alignItems:'center', gap:3 }}>
                      <span style={{ width:8, height:8, borderRadius:2, background:c, border:`1px solid ${c==='transparent'?'#3a3a50':c}`, display:'inline-block' }} />
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Liens */}
          {(book.inducks || book.isbn) && (
            <div>
              <label>Références</label>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {book.inducks && (
                  <a href={`https://coa.inducks.org/issue.php?c=${encodeURIComponent(book.inducks)}`} target="_blank" rel="noreferrer"
                    className="btn sm" style={{ textDecoration:'none' }}>
                    🦆 INDUCKS ↗
                  </a>
                )}
                {book.isbn && (
                  <a href={`https://openlibrary.org/isbn/${book.isbn}`} target="_blank" rel="noreferrer"
                    className="btn sm" style={{ textDecoration:'none' }}>
                    📖 Open Library ↗
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:4, borderTop:'1px solid var(--border)' }}>
            <button className="btn danger sm" onClick={handleDelete}>✕ Retirer de la collection</button>
          </div>
        </div>
      </div>
    </div>
  )
}
