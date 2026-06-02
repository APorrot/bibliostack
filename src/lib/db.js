// src/lib/db.js
import { openDB } from 'idb'

const DB_NAME = 'bibliostack'
const DB_VERSION = 2  // bumped for profiles store

let _db = null

export async function getDB() {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const shelves = db.createObjectStore('shelves', { keyPath: 'id' })
        shelves.createIndex('by-name', 'name')
        const books = db.createObjectStore('books', { keyPath: 'id' })
        books.createIndex('by-shelf',  'shelfId')
        books.createIndex('by-status', 'status')
        books.createIndex('by-series', 'series')
        books.createIndex('by-type',   'type')
        db.createObjectStore('settings')
      }
      if (oldVersion < 2) {
        // ── Profils ──
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' })
        }
        // Ajouter profileId aux stores existants
        if (!db.objectStoreNames.contains('shelves')) {
          const shelves = db.createObjectStore('shelves', { keyPath: 'id' })
          shelves.createIndex('by-name', 'name')
        }
        if (!db.objectStoreNames.contains('books')) {
          const books = db.createObjectStore('books', { keyPath: 'id' })
          books.createIndex('by-shelf',  'shelfId')
          books.createIndex('by-status', 'status')
          books.createIndex('by-series', 'series')
          books.createIndex('by-type',   'type')
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }
      }
    }
  })
  return _db
}

// ── Profiles ──────────────────────────────────────────────────
export async function getProfiles() {
  const db = await getDB()
  return db.getAll('profiles')
}
export async function saveProfile(profile) {
  const db = await getDB()
  await db.put('profiles', profile)
}
export async function deleteProfile(id) {
  const db = await getDB()
  await db.delete('profiles', id)
  // Supprimer les étagères et livres du profil
  const shelves = await db.getAll('shelves')
  const profileShelves = shelves.filter(s => s.profileId === id)
  const books = await db.getAll('books')
  const profileBooks = books.filter(b => b.profileId === id)
  const tx = db.transaction(['shelves', 'books'], 'readwrite')
  await Promise.all([
    ...profileShelves.map(s => tx.objectStore('shelves').delete(s.id)),
    ...profileBooks.map(b => tx.objectStore('books').delete(b.id)),
  ])
  await tx.done
}
export async function getCurrentProfileId() {
  const db = await getDB()
  return db.get('settings', 'currentProfileId') || null
}
export async function setCurrentProfileId(id) {
  const db = await getDB()
  await db.put('settings', id, 'currentProfileId')
}

// ── Shelves ──────────────────────────────────────────────────
export async function getShelves(profileId) {
  const db = await getDB()
  const all = await db.getAll('shelves')
  return profileId ? all.filter(s => s.profileId === profileId) : all
}
export async function saveShelf(shelf) {
  const db = await getDB()
  await db.put('shelves', shelf)
}
export async function deleteShelf(id) {
  const db = await getDB()
  await db.delete('shelves', id)
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

// ── Seed (premier lancement) ──────────────────────────────────
export async function seedDemoData(profileId) {
  const db = await getDB()
  const existing = await db.getAll('shelves')
  const profileShelves = existing.filter(s => s.profileId === profileId)
  if (profileShelves.length > 0) return

  const shelves = [
    { id: `${profileId}-disney`, profileId, name: 'Magazines Disney', desc: 'Collection INDUCKS', emoji: '🦆', type: 'disney', createdAt: Date.now() },
    { id: `${profileId}-manga`,  profileId, name: 'Mangas',           desc: 'Shōnen & shōjo',    emoji: '⚔️', type: 'manga',  createdAt: Date.now() },
    { id: `${profileId}-novels`, profileId, name: 'Romans',            desc: 'SF & fantastique',  emoji: '🚀', type: 'novel',  createdAt: Date.now() },
  ]
  const books = [
    { id: `${profileId}-b1`, profileId, shelfId: `${profileId}-disney`, title: 'Journal de Mickey N°2485', author: 'Collectif', type: 'disney', emoji: '🐭', series: 'Journal de Mickey', volume: 2485, status: 'read',    rating: 4, note: '', year: 2000, inducks: 'fr/JM 2485', isbn: '', volumes: null, coverUrl: null, createdAt: Date.now() },
    { id: `${profileId}-b2`, profileId, shelfId: `${profileId}-disney`, title: 'Picsou Magazine N°342',    author: 'Collectif', type: 'disney', emoji: '💰', series: 'Picsou Magazine',    volume: 342,  status: 'read',    rating: 5, note: '', year: 1999, inducks: 'fr/PM 342', isbn: '', volumes: null, coverUrl: null, createdAt: Date.now() },
    { id: `${profileId}-b3`, profileId, shelfId: `${profileId}-manga`,  title: 'Demon Slayer',   author: 'Koyoharu Gotouge', type: 'manga', emoji: '⚔️', series: 'Demon Slayer', volume: null, status: 'reading', rating: 5, note: '', year: 2016, inducks: '', isbn: '9782820328847', volumes: [{n:1,s:'read'},{n:2,s:'read'},{n:3,s:'read'},{n:4,s:'reading'},{n:5,s:'unread'}], coverUrl: null, createdAt: Date.now() },
    { id: `${profileId}-b4`, profileId, shelfId: `${profileId}-novels`, title: 'Dune', author: 'Frank Herbert', type: 'novel', emoji: '🌅', series: 'Dune', volume: 1, status: 'read', rating: 5, note: '', year: 1965, inducks: '', isbn: '9782266320566', volumes: null, coverUrl: null, createdAt: Date.now() },
  ]
  const tx = db.transaction(['shelves', 'books'], 'readwrite')
  await Promise.all([
    ...shelves.map(s => tx.objectStore('shelves').put(s)),
    ...books.map(b => tx.objectStore('books').put(b)),
  ])
  await tx.done
}

// ── Export / Import ───────────────────────────────────────────
export async function exportToJSON(profileId) {
  const [profiles, shelves, books] = await Promise.all([getProfiles(), getShelves(profileId), getBooks()])
  const profileBooks = profileId ? books.filter(b => b.profileId === profileId) : books
  return JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), profiles, shelves, books: profileBooks }, null, 2)
}
export async function importFromJSON(jsonString) {
  const data = JSON.parse(jsonString)
  const db = await getDB()
  const stores = ['shelves', 'books']
  if (data.profiles) stores.push('profiles')
  const tx = db.transaction(stores, 'readwrite')
  const ops = [
    ...( data.shelves  || []).map(s => tx.objectStore('shelves').put(s)),
    ...( data.books    || []).map(b => tx.objectStore('books').put(b)),
    ...((data.profiles || []).map(p => tx.objectStore('profiles').put(p))),
  ]
  await Promise.all(ops)
  await tx.done
}
