// src/store/useStore.jsx
import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import * as db from '../lib/db.js'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [profiles,     setProfiles]     = useState([])
  const [currentProfile, setCurrentProfileState] = useState(null)
  const [shelves,      setShelves]      = useState([])
  const [books,        setBooks]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [currentShelf, setCurrentShelf] = useState(null)
  const [view,         setView]         = useState('home')
  const [sidebarOpen,  setSidebarOpen]  = useState(false)

  // ── Init ──────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      let profs = await db.getProfiles()

      // Créer profil par défaut si aucun
      if (profs.length === 0) {
        const defaultProfile = { id: 'profile-default', name: 'Moi', emoji: '😊', createdAt: Date.now() }
        await db.saveProfile(defaultProfile)
        profs = [defaultProfile]
      }

      // Récupérer le profil courant
      let currentId = await db.getCurrentProfileId()
      if (!currentId || !profs.find(p => p.id === currentId)) {
        currentId = profs[0].id
        await db.setCurrentProfileId(currentId)
      }

      const currentProf = profs.find(p => p.id === currentId)
      setProfiles(profs)
      setCurrentProfileState(currentProf)

      await db.seedDemoData(currentId)
      const [s, b] = await Promise.all([db.getShelves(currentId), db.getBooks()])
      setShelves(s)
      setBooks(b.filter(bk => bk.profileId === currentId))
      setLoading(false)
    }
    init()
  }, [])

  // ── Changer de profil ─────────────────────────────────────
  const switchProfile = useCallback(async (profileId) => {
    await db.setCurrentProfileId(profileId)
    const prof = profiles.find(p => p.id === profileId)
    setCurrentProfileState(prof)
    await db.seedDemoData(profileId)
    const [s, b] = await Promise.all([db.getShelves(profileId), db.getBooks()])
    setShelves(s)
    setBooks(b.filter(bk => bk.profileId === profileId))
    setCurrentShelf(null)
    setView('home')
  }, [profiles])

  const addProfile = useCallback(async (profile) => {
    await db.saveProfile(profile)
    setProfiles(prev => [...prev, profile])
  }, [])

  const removeProfile = useCallback(async (id) => {
    if (profiles.length <= 1) return // garder au moins 1
    await db.deleteProfile(id)
    const remaining = profiles.filter(p => p.id !== id)
    setProfiles(remaining)
    if (currentProfile?.id === id) {
      await switchProfile(remaining[0].id)
    }
  }, [profiles, currentProfile, switchProfile])

  // ── Shelves ───────────────────────────────────────────────
  const addShelf = useCallback(async (shelf) => {
    const withProfile = { ...shelf, profileId: currentProfile?.id }
    await db.saveShelf(withProfile)
    setShelves(prev => [...prev.filter(s => s.id !== shelf.id), withProfile]
      .sort((a, b) => a.createdAt - b.createdAt))
  }, [currentProfile])

  const removeShelf = useCallback(async (id) => {
    if (!window.confirm('Supprimer cette étagère et tous ses livres ?')) return
    await db.deleteShelf(id)
    setShelves(prev => prev.filter(s => s.id !== id))
    setBooks(prev => prev.filter(b => b.shelfId !== id))
    if (currentShelf?.id === id) { setCurrentShelf(null); setView('home') }
  }, [currentShelf])

  // ── Books ─────────────────────────────────────────────────
  const addBook = useCallback(async (book) => {
    const withProfile = { ...book, profileId: currentProfile?.id }
    await db.saveBook(withProfile)
    setBooks(prev => [...prev.filter(b => b.id !== book.id), withProfile])
  }, [currentProfile])

  const updateBook = useCallback(async (id, patch) => {
    setBooks(prev => prev.map(b => {
      if (b.id !== id) return b
      const updated = { ...b, ...patch, updatedAt: Date.now() }
      db.saveBook(updated)
      return updated
    }))
  }, [])

  const removeBook = useCallback(async (id) => {
    await db.deleteBook(id)
    setBooks(prev => prev.filter(b => b.id !== id))
  }, [])

  const stats = {
    total:   books.length,
    read:    books.filter(b => b.status === 'read').length,
    reading: books.filter(b => b.status === 'reading').length,
    unread:  books.filter(b => b.status === 'unread').length,
    series:  new Set(books.filter(b => b.series).map(b => b.series)).size,
  }

  const exportData = useCallback(async () => {
    const json = await db.exportToJSON(currentProfile?.id)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `bibliostack-${currentProfile?.name || 'export'}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [currentProfile])

  const importData = useCallback(async (file) => {
    const text = await file.text()
    await db.importFromJSON(text)
    const [s, b] = await Promise.all([db.getShelves(currentProfile?.id), db.getBooks()])
    setShelves(s)
    setBooks(b.filter(bk => bk.profileId === currentProfile?.id))
  }, [currentProfile])

  const value = {
    // Profiles
    profiles, currentProfile, switchProfile, addProfile, removeProfile,
    // Navigation
    view, setView,
    sidebarOpen, setSidebarOpen,
    currentShelf, setCurrentShelf,
    // Data
    shelves, books, loading, stats,
    addShelf, removeShelf,
    addBook, updateBook, removeBook,
    exportData, importData,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
