// src/pages/ScanView.jsx
import { useState, useRef } from 'react'
import { useStore } from '../store/useStore.jsx'
import { searchAll, TYPE_META } from '../lib/api.js'
import AddBookModal from './AddBookModal.jsx'

const SOURCES = [
  { id:'auto',        label:'Auto' },
  { id:'openlibrary', label:'Open Library' },
  { id:'google',      label:'Google Books' },
  { id:'inducks',     label:'INDUCKS' },
]

export default function ScanView() {
  const { shelves } = useStore()
  const [mode,    setMode]    = useState('manual') // barcode | manual
  const [source,  setSource]  = useState('auto')
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [addBook, setAddBook] = useState(null) // prefill data
  const videoRef = useRef(null)

  const doSearch = async (q = query) => {
    if (!q.trim()) return
    setLoading(true)
    setResults([])
    try {
      const res = await searchAll(q.trim(), { source })
      setResults(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const startCamera = async () => {
    setMode('barcode')
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser')
      const reader = new BrowserMultiFormatReader()
      const devices = await BrowserMultiFormatReader.listVideoInputDevices()
      const backCam = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[devices.length-1]
      await reader.decodeFromVideoDevice(
        backCam?.deviceId,
        videoRef.current,
        (result) => {
          if (result) {
            reader.reset()
            setMode('manual')
            const isbn = result.getText()
            setQuery(isbn)
            doSearch(isbn)
          }
        }
      )
    } catch (e) {
      alert('Caméra inaccessible : ' + e.message)
      setMode('manual')
    }
  }

  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'16px' }}>
      <h2 style={{ marginBottom:14 }}>Ajouter un livre</h2>

      {/* Mode tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:12 }}>
        {[['manual','⌨ Manuel'],['barcode','📷 Code-barres']].map(([m, l]) => (
          <button
            key={m}
            className="btn"
            onClick={() => m === 'barcode' ? startCamera() : setMode('manual')}
            style={{
              background: mode === m ? 'rgba(123,110,246,.15)' : 'var(--bg2)',
              color: mode === m ? 'var(--accent2)' : 'var(--text2)',
              borderColor: mode === m ? 'var(--accent)' : 'var(--border)',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Viewfinder caméra */}
      {mode === 'barcode' && (
        <div style={{
          aspectRatio:'16/7', background:'#000', borderRadius:12,
          display:'flex', alignItems:'center', justifyContent:'center',
          overflow:'hidden', marginBottom:12, position:'relative',
        }}>
          <video ref={videoRef} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          {/* Cadre de visée */}
          <div style={{
            position:'absolute', width:'55%', height:'60%',
            border:'2px solid rgba(123,110,246,.8)',
            borderRadius:8,
            boxShadow:'0 0 0 9999px rgba(0,0,0,.4)',
          }} />
          <div style={{
            position:'absolute', width:'55%', height:'2px',
            background:'var(--accent)', opacity:.8,
            animation:'scan-laser 2s ease-in-out infinite',
          }} />
        </div>
      )}

      {/* Barre de recherche */}
      <div style={{ display:'flex', gap:6, marginBottom:10 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="Titre, auteur, ISBN, code INDUCKS…"
          style={{ flex:1 }}
          autoFocus={mode === 'manual'}
        />
        <button className="btn primary" onClick={() => doSearch()} disabled={loading}>
          {loading ? <span className="spin">◌</span> : '⌕'}
        </button>
      </div>

      {/* Source selector */}
      <div style={{ display:'flex', gap:4, marginBottom:14, flexWrap:'wrap' }}>
        {SOURCES.map(s => (
          <button
            key={s.id}
            className="btn xs"
            onClick={() => setSource(s.id)}
            style={{
              background: source === s.id ? 'var(--accent)' : 'var(--bg3)',
              color: source === s.id ? 'white' : 'var(--text2)',
              borderColor: source === s.id ? 'var(--accent)' : 'var(--border)',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text2)' }}>
          <div className="spin" style={{ fontSize:24, display:'block', marginBottom:8 }}>◌</div>
          Recherche sur {source === 'auto' ? 'toutes les sources' : SOURCES.find(s=>s.id===source)?.label}…
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:8 }}>{results.length} résultat(s)</div>
          {results.map(r => (
            <div key={r.id} style={{
              background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10,
              padding:10, display:'flex', gap:10, marginBottom:7,
            }}>
              <div style={{
                width:44, height:64, borderRadius:6, flexShrink:0,
                background:`linear-gradient(150deg, ${TYPE_META[r.type]?.gradient[0]}22, ${TYPE_META[r.type]?.gradient[1]}33)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                overflow:'hidden',
              }}>
                {r.coverUrl
                  ? <img src={r.coverUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ opacity:.5 }}>{TYPE_META[r.type]?.emoji}</span>
                }
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:500, fontSize:13, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.title}</div>
                <div style={{ fontSize:11, color:'var(--text2)', marginBottom:5 }}>{r.author}{r.year ? ` · ${r.year}` : ''}</div>
                <div style={{ display:'flex', gap:4 }}>
                  <span className={`tag ${r.type}`}>{TYPE_META[r.type]?.label}</span>
                  <span style={{ fontSize:10, color:'var(--text3)', background:'var(--bg3)', padding:'2px 6px', borderRadius:8 }}>{r.source}</span>
                </div>
              </div>
              <button
                className="btn primary sm"
                style={{ alignSelf:'center', flexShrink:0 }}
                onClick={() => setAddBook(r)}
              >
                + Ajouter
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text2)', fontSize:13 }}>
          Aucun résultat. Essayez un autre terme ou{' '}
          <span
            style={{ color:'var(--accent2)', cursor:'pointer' }}
            onClick={() => setAddBook({ title: query, author:'', type:'novel', source:'Manuel' })}
          >
            ajoutez manuellement
          </span>.
        </div>
      )}

      {/* + Ajouter manuellement sans recherche */}
      <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
        <button
          className="btn"
          style={{ width:'100%', justifyContent:'center' }}
          onClick={() => setAddBook({ title:'', author:'', type:'novel', source:'Manuel' })}
        >
          ＋ Saisie manuelle complète
        </button>
      </div>

      {/* Modal d'ajout */}
      {addBook && (
        <AddBookModal
          prefill={addBook}
          onClose={() => setAddBook(null)}
        />
      )}

      <style>{`
        @keyframes scan-laser {
          0%,100% { top: 20% }
          50% { top: 70% }
        }
      `}</style>
    </div>
  )
}
