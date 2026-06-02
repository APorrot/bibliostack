// src/components/ProfilePanel.jsx
import { useState } from 'react'
import { useStore } from '../store/useStore.jsx'

const EMOJIS = ['😊','👦','👧','👨','👩','🧑','👴','👵','🧔','👱','🦸','🧙','🐱','🐶','🦊','🐼','🎮','📚','🎵','⚽']

export default function ProfilePanel({ onClose }) {
  const { profiles, currentProfile, switchProfile, addProfile, removeProfile } = useStore()
  const [creating, setCreating] = useState(false)
  const [newName,  setNewName]  = useState('')
  const [newEmoji, setNewEmoji] = useState('😊')

  const handleCreate = async () => {
    if (!newName.trim()) return
    const profile = {
      id: `profile-${Date.now()}`,
      name: newName.trim(),
      emoji: newEmoji,
      createdAt: Date.now(),
    }
    await addProfile(profile)
    await switchProfile(profile.id)
    setCreating(false)
    setNewName('')
    onClose()
  }

  const handleSwitch = async (id) => {
    if (id === currentProfile?.id) { onClose(); return }
    await switchProfile(id)
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ maxWidth:400 }}>
        <div className="modal-handle" />
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontWeight:600, fontSize:15 }}>Profils</span>
          <button className="btn ghost icon" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding:'12px 16px' }}>
          {/* Liste des profils */}
          {profiles.map(p => {
            const isActive = p.id === currentProfile?.id
            return (
              <div
                key={p.id}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'10px 12px', borderRadius:10, marginBottom:6,
                  background: isActive ? 'rgba(123,110,246,.12)' : 'var(--bg3)',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  cursor:'pointer', transition:'all .12s',
                }}
                onClick={() => handleSwitch(p.id)}
              >
                <span style={{ fontSize:22 }}>{p.emoji}</span>
                <span style={{ flex:1, fontWeight:500, fontSize:14 }}>{p.name}</span>
                {isActive && (
                  <span style={{ fontSize:11, color:'var(--accent2)', fontWeight:600 }}>Actif</span>
                )}
                {!isActive && profiles.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); removeProfile(p.id) }}
                    style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:16, padding:4 }}
                    title="Supprimer ce profil"
                  >✕</button>
                )}
              </div>
            )
          })}

          {/* Créer un profil */}
          {!creating ? (
            <button
              className="btn"
              style={{ width:'100%', justifyContent:'center', marginTop:4 }}
              onClick={() => setCreating(true)}
            >
              ＋ Nouveau profil
            </button>
          ) : (
            <div style={{ marginTop:8, background:'var(--bg3)', borderRadius:10, padding:12, border:'1px solid var(--border)' }}>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600 }}>Nouveau profil</div>

              {/* Choix emoji */}
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
                {EMOJIS.map(e => (
                  <div
                    key={e}
                    onClick={() => setNewEmoji(e)}
                    style={{
                      width:32, height:32, borderRadius:7, display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:18, cursor:'pointer',
                      border:`1px solid ${newEmoji===e ? 'var(--accent)' : 'var(--border)'}`,
                      background: newEmoji===e ? 'rgba(123,110,246,.15)' : 'var(--bg2)',
                      transition:'all .1s',
                    }}
                  >{e}</div>
                ))}
              </div>

              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Prénom ou pseudo…"
                autoFocus
                style={{ marginBottom:8 }}
              />
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn" style={{ flex:1, justifyContent:'center' }} onClick={() => setCreating(false)}>Annuler</button>
                <button className="btn primary" style={{ flex:1, justifyContent:'center' }} onClick={handleCreate}>Créer</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ height:8 }} />
      </div>
    </div>
  )
}
