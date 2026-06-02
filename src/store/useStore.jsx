// src/store/useStore.js
import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import * as db from '../lib/db.js'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [shelves,  setShelves]  = useState([])
  const [books,    setBooks]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [currentShelf, setCurrentShelf] = useState(null) // null = toute la collection
  const [view,     setView]     = useState('home')       // home | scan | stats | alerts | shelf

  // ── Init ──────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      await db.seedDemoData()
      const [s, b] = await Promise.all([db.getShelves(), db.getBooks()])
      setShelves(s)
      setBooks(b)
      setLoading(false)
    }
    init()
  }, [])

  // ── Shelves ───────────────────────────────────────────────
  const addShelf = useCallback(async (shelf) => {
    await db.saveShelf(shelf)
    setShelves(prev => [...prev.filter(s => s.id !== shelf.id), shelf]
      .sort((a, b) => a.createdAt - b.createdAt))
  }, [])

  const removeShelf = useCallback(async (id) => {
    await db.deleteShelf(id)
    setShelves(prev => prev.filter(s => s.id !== id))
    setBooks(prev => prev.filter(b => b.shelfId !== id))
  }, [])

  // ── Books ─────────────────────────────────────────────────
  const addBook = useCallback(async (book) => {
    await db.saveBook(book)
    setBooks(prev => [...prev.filter(b => b.id !== book.id), book])
  }, [])

  const updateBook = useCallback(async (id, patch) => {
    setBooks(prev => prev.map(b => {
      if (b.id !== id) return b
      const updated = { ...b, ...patch, updatedAt: Date.now() }
      db.saveBook(updated) // fire-and-forget
      return updated
    }))
  }, [])

  const removeBook = useCallback(async (id) => {
    await db.deleteBook(id)
    setBooks(prev => prev.filter(b => b.id !== id))
  }, [])

  // ── Derived ───────────────────────────────────────────────
  const booksForShelf = useCallback((shelfId) =>
    books.filter(b => b.shelfId === shelfId), [books])

  const stats = {
    total:   books.length,
    read:    books.filter(b => b.status === 'read').length,
    reading: books.filter(b => b.status === 'reading').length,
    unread:  books.filter(b => b.status === 'unread').length,
    series:  new Set(books.filter(b => b.series).map(b => b.series)).size,
  }

  // ── Export / Import ───────────────────────────────────────
  const exportData = useCallback(async () => {
    const json = await db.exportToJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `bibliostack-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const importData = useCallback(async (file) => {
    const text = await file.text()
    await db.importFromJSON(text)
    const [s, b] = await Promise.all([db.getShelves(), db.getBooks()])
    setShelves(s)
    setBooks(b)
  }, [])

  const value = {
    shelves, books, loading, stats,
    currentShelf, setCurrentShelf,
    view, setView,
    addShelf, removeShelf,
    addBook, updateBook, removeBook,
    booksForShelf,
    exportData, importData,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
