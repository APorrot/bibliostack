// src/lib/db.js
// Couche IndexedDB via la librairie `idb` (wrapper Promise sur IndexedDB natif)
import { openDB } from 'idb'

const DB_NAME = 'bibliostack'
const DB_VERSION = 1

let _db = null

export async function getDB() {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // ── Étagères ──
      if (!db.objectStoreNames.contains('shelves')) {
        const shelves = db.createObjectStore('shelves', { keyPath: 'id' })
        shelves.createIndex('by-name', 'name')
      }
      // ── Livres ──
      if (!db.objectStoreNames.contains('books')) {
        const books = db.createObjectStore('books', { keyPath: 'id' })
        books.createIndex('by-shelf',  'shelfId')
        books.createIndex('by-status', 'status')
        books.createIndex('by-series', 'series')
        books.createIndex('by-type',   'type')
      }
      // ── Paramètres (clé/valeur) ──
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings')
      }
    }
  })
  return _db
}

// ── Shelves ──────────────────────────────────────────────────
export async function getShelves() {
  const db = await getDB()
  return db.getAll('shelves')
}
export async function saveShelf(shelf) {
  const db = await getDB()
  await db.put('shelves', shelf)
}
export async function deleteShelf(id) {
  const db = await getDB()
  await db.delete('shelves', id)
  // Supprimer les livres de cette étagère
  const books = await db.getAllFromIndex('books', 'by-shelf', id)
  const tx = db.transaction('books', 'readwrite')
  await Promise.all(books.map(b => tx.store.delete(b.id)))
  await tx.done
}

// ── Books ─────────────────────────────────────────────────────
export async function getBooks(shelfId = null) {
  const db = await getDB()
  if (shelfId) return db.getAllFromIndex('books', 'by-shelf', shelfId)
  return db.getAll('books')
}
export async function getBook(id) {
  const db = await getDB()
  return db.get('books', id)
}
export async function saveBook(book) {
  const db = await getDB()
  await db.put('books', { ...book, updatedAt: Date.now() })
}
export async function deleteBook(id) {
  const db = await getDB()
  await db.delete('books', id)
}

// ── Settings ──────────────────────────────────────────────────
export async function getSetting(key, defaultValue = null) {
  const db = await getDB()
  const val = await db.get('settings', key)
  return val ?? defaultValue
}
export async function setSetting(key, value) {
  const db = await getDB()
  await db.put('settings', value, key)
}

// ── Seed données de démo (premier lancement) ─────────────────
export async function seedDemoData() {
  const db = await getDB()
  const existing = await db.count('shelves')
  if (existing > 0) return // Déjà peuplé

  const shelves = [
    { id: 'disney', name: 'Magazines Disney', desc: 'Collection INDUCKS', emoji: '🦆', type: 'disney', createdAt: Date.now() },
    { id: 'manga',  name: 'Mangas',           desc: 'Shōnen & shōjo',    emoji: '⚔️', type: 'manga',  createdAt: Date.now() },
    { id: 'novels', name: 'Romans',            desc: 'SF & fantastique',  emoji: '🚀', type: 'novel',  createdAt: Date.now() },
  ]
  const books = [
    { id: 'b1', shelfId: 'disney', title: 'Journal de Mickey N°2485', author: 'Collectif', type: 'disney', emoji: '🐭', series: 'Journal de Mickey', volume: 2485, status: 'read',    rating: 4, note: 'Très bel état.', year: 2000, inducks: 'fr/JM 2485', isbn: '', volumes: null, coverUrl: null, createdAt: Date.now() },
    { id: 'b2', shelfId: 'disney', title: 'Picsou Magazine N°342',    author: 'Collectif', type: 'disney', emoji: '💰', series: 'Picsou Magazine',    volume: 342,  status: 'read',    rating: 5, note: '', year: 1999, inducks: 'fr/PM 342', isbn: '', volumes: null, coverUrl: null, createdAt: Date.now() },
    { id: 'b3', shelfId: 'disney', title: 'Mickey Parade N°213',      author: 'Collectif', type: 'disney', emoji: '🐭', series: 'Mickey Parade',      volume: 213,  status: 'unread',  rating: 0, note: '', year: 1997, inducks: 'fr/MP 213', isbn: '', volumes: null, coverUrl: null, createdAt: Date.now() },
    { id: 'b4', shelfId: 'manga',  title: 'Demon Slayer',   author: 'Koyoharu Gotouge', type: 'manga', emoji: '⚔️', series: 'Demon Slayer',   volume: null, status: 'reading', rating: 5, note: 'Excellente série !', year: 2016, inducks: '', isbn: '9782820328847', volumes: [{n:1,s:'read'},{n:2,s:'read'},{n:3,s:'read'},{n:4,s:'read'},{n:5,s:'reading'},{n:6,s:'unread'},{n:7,s:'unread'}], coverUrl: 'https://covers.openlibrary.org/b/isbn/9782820328847-M.jpg', createdAt: Date.now() },
    { id: 'b5', shelfId: 'manga',  title: 'One Piece',      author: 'Eiichiro Oda',     type: 'manga', emoji: '🌊', series: 'One Piece',      volume: null, status: 'reading', rating: 5, note: 'La référence.', year: 1997, inducks: '', isbn: '9782723430920', volumes: [{n:1,s:'read'},{n:2,s:'read'},{n:3,s:'read'},{n:4,s:'read'},{n:5,s:'read'},{n:6,s:'read'},{n:7,s:'read'},{n:8,s:'reading'},{n:9,s:'unread'},{n:10,s:'unread'}], coverUrl: null, createdAt: Date.now() },
    { id: 'b6', shelfId: 'novels', title: 'Dune',        author: 'Frank Herbert', type: 'novel', emoji: '🌅', series: 'Dune',    volume: 1, status: 'read',    rating: 5, note: 'Masterpiece absolu.', year: 1965, inducks: '', isbn: '9782266320566', volumes: null, coverUrl: 'https://covers.openlibrary.org/b/isbn/9782266320566-M.jpg', createdAt: Date.now() },
    { id: 'b7', shelfId: 'novels', title: 'Fondation',   author: 'Isaac Asimov',  type: 'novel', emoji: '🤖', series: 'Fondation', volume: 1, status: 'read',  rating: 5, note: '', year: 1951, inducks: '', isbn: '9782070360536', volumes: null, coverUrl: null, createdAt: Date.now() },
    { id: 'b8', shelfId: 'novels', title: 'Neuromancien', author: 'William Gibson', type: 'novel', emoji: '💾', series: null, volume: null, status: 'unread', rating: 0, note: '', year: 1984, inducks: '', isbn: '9782253053606', volumes: null, coverUrl: null, createdAt: Date.now() },
  ]

  const tx = db.transaction(['shelves', 'books'], 'readwrite')
  await Promise.all([
    ...shelves.map(s => tx.objectStore('shelves').put(s)),
    ...books.map(b => tx.objectStore('books').put(b)),
  ])
  await tx.done
}

// ── Export JSON ───────────────────────────────────────────────
export async function exportToJSON() {
  const [shelves, books] = await Promise.all([getShelves(), getBooks()])
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), shelves, books }, null, 2)
}

// ── Import JSON ───────────────────────────────────────────────
export async function importFromJSON(jsonString) {
  const data = JSON.parse(jsonString)
  const db = await getDB()
  const tx = db.transaction(['shelves', 'books'], 'readwrite')
  await Promise.all([
    ...data.shelves.map(s => tx.objectStore('shelves').put(s)),
    ...data.books.map(b => tx.objectStore('books').put(b)),
  ])
  await tx.done
}
