// src/pages/StatsView.jsx
import { useStore } from '../store/useStore.jsx'
import { TYPE_META } from '../lib/api.js'

export default function StatsView() {
  const { books, shelves, stats } = useStore()

  const byType  = {}
  const byShelf = {}
  const byYear  = {}
  books.forEach(b => {
    byType[b.type]  = (byType[b.type]  || 0) + 1
    const s = shelves.find(x => x.id === b.shelfId)
    if (s) byShelf[s.name] = (byShelf[s.name] || 0) + 1
    if (b.year) byYear[b.year] = (byYear[b.year] || 0) + 1
  })

  const maxType  = Math.max(...Object.values(byType),  1)
  const maxShelf = Math.max(...Object.values(byShelf), 1)
  const totalVols = books.reduce((s, b) => s + (b.volumes?.filter(v=>v.s!=='missing').length || 0), 0)

  const TYPE_COLORS = { disney:'#f5c842', manga:'#a78bfa', novel:'#60a5fa', comic:'#fb923c', mixed:'#4ade80' }

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'16px' }}>
      <h2 style={{ marginBottom:16 }}>Statistiques</h2>

      {/* Big numbers */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8, marginBottom:16 }}>
        {[
          ['Total',        stats.total,   'livres'],
          ['Lus',          stats.read,    `${stats.total ? Math.round(stats.read/stats.total*100) : 0}%`],
          ['En cours',     stats.reading, 'lectures actives'],
          ['Tomes suivis', totalVols,     'volumes'],
        ].map(([l, v, s]) => (
          <div key={l} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:12 }}>
            <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:3 }}>{l}</div>
            <div style={{ fontSize:26, fontWeight:600, letterSpacing:'-.02em' }}>{v}</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Reading status */}
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:14, marginBottom:12 }}>
        <div style={{ fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:10, textTransform:'uppercase', letterSpacing:'.05em' }}>Statuts de lecture</div>
        <div style={{ display:'flex', gap:6, marginBottom:8 }}>
          {[['read','#4ade80'],[' reading','#f5c842'],['unread','#3a3a50']].map(([k,c]) => {
            const count = books.filter(b=>b.status===k.trim()).length
            const pct   = stats.total ? count/stats.total : 0
            return (
              <div key={k} style={{ flex: pct || .01, height:8, background:c, borderRadius:4, minWidth:4, transition:'flex .4s' }} />
            )
          })}
        </div>
        <div style={{ display:'flex', gap:12, fontSize:12 }}>
          {[['Lu','#4ade80','read'],['En cours','#f5c842','reading'],['Non lu','#5a5a78','unread']].map(([l,c,k]) => (
            <span key={k} style={{ display:'flex', alignItems:'center', gap:4, color:'var(--text2)' }}>
              <span style={{ width:8, height:8, borderRadius:2, background:c, display:'inline-block' }} />
              {l} ({books.filter(b=>b.status===k).length})
            </span>
          ))}
        </div>
      </div>

      {/* Par type */}
      <BarChart title="Par type de média" data={byType} max={maxType} colorFn={t => TYPE_COLORS[t] || '#888'} labelFn={t => `${TYPE_META[t]?.emoji || ''} ${TYPE_META[t]?.label || t}`} />

      {/* Par étagère */}
      <BarChart title="Par étagère" data={byShelf} max={maxShelf} colorFn={() => 'var(--accent)'} labelFn={l => l} />

      {/* Séries suivies */}
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:14, marginBottom:12 }}>
        <div style={{ fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:10, textTransform:'uppercase', letterSpacing:'.05em' }}>Séries avec suivi de tomes</div>
        {books.filter(b => b.volumes).map(b => {
          const read  = b.volumes.filter(v => v.s === 'read').length
          const total = b.volumes.filter(v => v.s !== 'missing').length
          const pct   = Math.round(read/total*100)
          return (
            <div key={b.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ fontSize:16, width:24, textAlign:'center' }}>{b.emoji}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.series || b.title}</div>
                <div style={{ background:'var(--bg4)', borderRadius:2, height:4, overflow:'hidden', marginTop:3 }}>
                  <div style={{ width:`${pct}%`, height:'100%', background:'var(--accent)', borderRadius:2 }} />
                </div>
              </div>
              <div style={{ fontSize:11, color:'var(--text2)', flexShrink:0 }}>{read}/{total}</div>
            </div>
          )
        })}
        {!books.some(b => b.volumes) && (
          <div style={{ fontSize:12, color:'var(--text3)' }}>Ajoutez des mangas pour voir la progression des tomes.</div>
        )}
      </div>
    </div>
  )
}

function BarChart({ title, data, max, colorFn, labelFn }) {
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:14, marginBottom:12 }}>
      <div style={{ fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:10, textTransform:'uppercase', letterSpacing:'.05em' }}>{title}</div>
      {Object.entries(data).sort((a,b)=>b[1]-a[1]).map(([k, n]) => (
        <div key={k} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
          <div style={{ fontSize:12, color:'var(--text2)', width:110, flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{labelFn(k)}</div>
          <div style={{ flex:1, height:18, background:'var(--bg4)', borderRadius:3, overflow:'hidden' }}>
            <div style={{
              width:`${Math.round(n/max*100)}%`, height:'100%',
              background: colorFn(k), borderRadius:3,
              display:'flex', alignItems:'center', paddingLeft:6,
              transition:'width .5s ease',
            }}>
              <span style={{ fontSize:10, fontWeight:500, color:'rgba(0,0,0,.7)' }}>{n}</span>
            </div>
          </div>
          <div style={{ fontSize:11, color:'var(--text3)', width:20, textAlign:'right', flexShrink:0 }}>{n}</div>
        </div>
      ))}
    </div>
  )
}
