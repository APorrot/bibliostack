// src/components/BookCard.jsx
import { TYPE_META } from '../lib/api.js'

const STATUS_DOT = {
  read:    '#4ade80',
  reading: '#f5c842',
  unread:  '#3a3a50',
}

export default function BookCard({ book, onClick }) {
  const tm = TYPE_META[book.type] || TYPE_META.novel

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color .15s, transform .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.transform='translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)';  e.currentTarget.style.transform='translateY(0)' }}
    >
      {/* Cover */}
      <div style={{
        aspectRatio: '2/3',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(150deg, ${tm.gradient[0]}18, ${tm.gradient[1]}28)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {book.coverUrl
          ? <img src={book.coverUrl} alt={book.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />
          : <span style={{ fontSize:36, opacity:.5 }}>{book.emoji}</span>
        }
        {/* Status dot */}
        <div style={{
          position:'absolute', top:6, right:6,
          width:9, height:9,
          borderRadius:'50%',
          background: STATUS_DOT[book.status],
          border: '1.5px solid rgba(255,255,255,.2)',
        }} />
        {/* Volume badge */}
        {book.volume && (
          <div style={{
            position:'absolute', bottom:5, left:5,
            fontSize:10, fontWeight:500,
            padding:'2px 5px', borderRadius:4,
            background:'rgba(0,0,0,.55)', color:'white',
          }}>
            N°{book.volume}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:'8px 9px' }}>
        <div style={{ fontSize:12, fontWeight:500, lineHeight:1.3, marginBottom:2, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {book.title}
        </div>
        <div style={{ fontSize:11, color:'var(--text3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {book.author}
        </div>
        {book.rating > 0 && (
          <div style={{ marginTop:4, display:'flex', gap:1 }}>
            {[1,2,3,4,5].map(n => (
              <span key={n} style={{ fontSize:10, color: n <= book.rating ? 'var(--yellow)' : 'var(--bg4)' }}>★</span>
            ))}
          </div>
        )}
        {/* Volume progress bar for manga series */}
        {book.volumes && (() => {
          const total = book.volumes.filter(v => v.s !== 'missing').length
          const read  = book.volumes.filter(v => v.s === 'read').length
          return (
            <div style={{ marginTop:5 }}>
              <div style={{ background:'var(--bg4)', borderRadius:2, height:3, overflow:'hidden' }}>
                <div style={{ width:`${Math.round(read/total*100)}%`, height:'100%', background:'var(--accent)', borderRadius:2 }} />
              </div>
              <div style={{ fontSize:9, color:'var(--text3)', marginTop:2 }}>{read}/{total} tomes</div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
