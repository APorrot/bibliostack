// src/pages/AlertsView.jsx
import { useStore } from '../store/useStore.jsx'

// Simule les nouvelles sorties détectées pour les séries suivies.
// En production : cron job côté serveur qui interroge OpenLibrary/MangaUpdates
// et stocke les alertes dans Supabase.
function getAlerts(books) {
  const series = [...new Set(books.filter(b => b.series).map(b => b.series))]
  // Données factices — à remplacer par vraie API
  const MOCK = {
    'Demon Slayer':   { newVol: 23, date: 'Juin 2025',   source: 'OpenLibrary' },
    'One Piece':      { newVol: 110, date: 'Juillet 2025', source: 'OpenLibrary' },
    'Jujutsu Kaisen': { newVol: 28, date: 'Août 2025',   source: 'OpenLibrary' },
    'Dune':           { newVol: null, reissue: 'Nouvelle édition collector', date: 'Mai 2025', source: 'Google Books' },
  }
  return series
    .filter(s => MOCK[s])
    .map(s => ({ series:s, ...MOCK[s], book: books.find(b => b.series === s) }))
}

export default function AlertsView() {
  const { books } = useStore()
  const alerts = getAlerts(books)

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'16px' }}>
      <h2 style={{ marginBottom:4 }}>Alertes sorties</h2>
      <div style={{ fontSize:12, color:'var(--text2)', marginBottom:16 }}>
        Nouvelles sorties détectées pour vos séries suivies
      </div>

      {alerts.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text2)' }}>
          <div style={{ fontSize:40, marginBottom:10, opacity:.3 }}>🔔</div>
          <div style={{ fontSize:14, color:'var(--text)', marginBottom:6 }}>Aucune alerte</div>
          <div style={{ fontSize:12 }}>Ajoutez des séries à votre collection pour recevoir des alertes.</div>
        </div>
      )}

      {alerts.map((a, i) => (
        <div key={i} style={{
          background:'var(--bg2)', border:'1px solid var(--border)',
          borderRadius:12, padding:12, marginBottom:8,
          display:'flex', alignItems:'center', gap:10,
        }}>
          <div style={{
            width:40, height:56, borderRadius:6, flexShrink:0,
            background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:20, overflow:'hidden',
          }}>
            {a.book?.coverUrl
              ? <img src={a.book.coverUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : a.book?.emoji
            }
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:500, fontSize:13, marginBottom:2 }}>{a.series}</div>
            <div style={{ fontSize:12, color:'var(--text2)' }}>
              {a.newVol ? `Tome ${a.newVol} disponible` : a.reissue} · {a.date}
            </div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>via {a.source}</div>
          </div>
          <span style={{
            fontSize:10, fontWeight:500,
            padding:'3px 8px', borderRadius:10,
            background:'rgba(251,146,60,.12)',
            color:'#fb923c',
            border:'1px solid rgba(251,146,60,.25)',
            flexShrink:0,
          }}>Nouveau</span>
        </div>
      ))}

      {/* Info technique */}
      <div style={{
        marginTop:16, padding:12,
        background:'rgba(123,110,246,.06)',
        border:'1px solid rgba(123,110,246,.15)',
        borderRadius:10, fontSize:12, color:'var(--text2)',
      }}>
        <div style={{ fontWeight:500, color:'var(--text)', marginBottom:4 }}>Comment ça marche ?</div>
        Les alertes sont générées en comparant vos séries avec les nouvelles parutions sur{' '}
        <strong>Open Library</strong>, <strong>Google Books</strong> et{' '}
        <strong>MangaUpdates</strong>. En production, un job tourne quotidiennement côté serveur.
      </div>
    </div>
  )
}
