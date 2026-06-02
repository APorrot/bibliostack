// src/lib/api.js
// Connecteurs vers les 3 sources : INDUCKS, Open Library, Google Books

// ── Open Library ─────────────────────────────────────────────
export async function searchOpenLibrary(query) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8&fields=key,title,author_name,first_publish_year,isbn,number_of_pages_median,subject,cover_i`
  const res = await fetch(url)
  const data = await res.json()
  return (data.docs || []).map(doc => ({
    id:        `ol-${doc.key}`,
    source:    'Open Library',
    title:     doc.title,
    author:    doc.author_name?.[0] || 'Auteur inconnu',
    year:      doc.first_publish_year || null,
    isbn:      doc.isbn?.[0] || '',
    coverUrl:  doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
    type:      detectType(doc.subject || [], doc.title),
    inducks:   '',
    series:    null,
    volumes:   null,
  }))
}

export async function searchByISBN(isbn) {
  const clean = isbn.replace(/[^0-9X]/gi, '')
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${clean}&format=json&jscmd=data`
  const res = await fetch(url)
  const data = await res.json()
  const key = `ISBN:${clean}`
  if (!data[key]) return null
  const book = data[key]
  return {
    id:       `ol-isbn-${clean}`,
    source:   'Open Library',
    title:    book.title,
    author:   book.authors?.[0]?.name || 'Auteur inconnu',
    year:     book.publish_date ? parseInt(book.publish_date) : null,
    isbn:     clean,
    coverUrl: book.cover?.medium || null,
    type:     detectType(book.subjects?.map(s => s.name) || [], book.title),
    inducks:  '',
    series:   null,
    volumes:  null,
  }
}

// ── Google Books ──────────────────────────────────────────────
export async function searchGoogleBooks(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8&langRestrict=fr`
  const res = await fetch(url)
  const data = await res.json()
  return (data.items || []).map(item => {
    const info = item.volumeInfo || {}
    return {
      id:       `gb-${item.id}`,
      source:   'Google Books',
      title:    info.title || 'Sans titre',
      author:   info.authors?.[0] || 'Auteur inconnu',
      year:     info.publishedDate ? parseInt(info.publishedDate) : null,
      isbn:     info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier || '',
      coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
      type:     detectType(info.categories || [], info.title),
      inducks:  '',
      series:   null,
      volumes:  null,
    }
  })
}

// ── INDUCKS (COA) ─────────────────────────────────────────────
// INDUCKS n'a pas d'API JSON officielle. On utilise une stratégie
// de proxy CORS + scraping léger de coa.inducks.org.
// En production, vous aurez besoin d'un backend minimal (Vercel serverless function)
// pour relayer les requêtes et parser le HTML.
// Pour la PWA, on simule la réponse avec un fallback.
export async function searchINDUCKS(query) {
  // TODO: remplacer par votre serverless function Vercel :
  // const res = await fetch(`/api/inducks?q=${encodeURIComponent(query)}`)
  // return res.json()

  // Simulation pour le développement :
  console.log('[INDUCKS] Requête simulée pour :', query)
  return []
}

export async function getINDUCKSIssue(code) {
  // TODO: /api/inducks-issue?code=fr/JM+2485
  console.log('[INDUCKS] Issue simulée :', code)
  return null
}

// ── Recherche combinée auto ───────────────────────────────────
export async function searchAll(query, { source = 'auto' } = {}) {
  const isISBN = /^[0-9]{10,13}$/.test(query.replace(/[^0-9]/g, ''))

  if (isISBN) {
    // ISBN → Open Library en priorité
    const byISBN = await searchByISBN(query)
    if (byISBN) return [byISBN]
  }

  const looksDisney = /mickey|donald|picsou|disney|daisy|dingo|pluto|inducks/i.test(query)
    || /^[a-z]{2}\/[A-Z]+\s*\d+/.test(query) // code inducks style "fr/JM 2485"

  if (source === 'inducks' || (source === 'auto' && looksDisney)) {
    const inducks = await searchINDUCKS(query)
    if (inducks.length) return inducks
  }

  if (source === 'openlibrary') return searchOpenLibrary(query)
  if (source === 'google')      return searchGoogleBooks(query)

  // Auto : essaie les deux et fusionne
  const [ol, gb] = await Promise.allSettled([
    searchOpenLibrary(query),
    searchGoogleBooks(query),
  ])
  const results = [
    ...(ol.status === 'fulfilled' ? ol.value : []),
    ...(gb.status === 'fulfilled' ? gb.value : []),
  ]
  // Déduplique par ISBN
  const seen = new Set()
  return results.filter(r => {
    if (!r.isbn) return true
    if (seen.has(r.isbn)) return false
    seen.add(r.isbn)
    return true
  }).slice(0, 10)
}

// ── Helpers ───────────────────────────────────────────────────
function detectType(subjects, title = '') {
  const all = [...subjects, title].join(' ').toLowerCase()
  if (/manga|manhwa|manhua|graphic novel|bande dessin/i.test(all)) return 'manga'
  if (/disney|mickey|donald|picsou|comics|bd /i.test(all))         return 'disney'
  if (/roman|fiction|novel|science.fiction|fantasy/i.test(all))    return 'novel'
  return 'novel' // défaut
}

export const TYPE_META = {
  disney: { label: 'BD Disney',  emoji: '🦆', gradient: ['#FEF3DC', '#FAC775'] },
  manga:  { label: 'Manga',      emoji: '⛩️',  gradient: ['#EEEDFE', '#CECBF6'] },
  novel:  { label: 'Roman',      emoji: '📖', gradient: ['#E6F1FB', '#B5D4F4'] },
  comic:  { label: 'BD/Comics',  emoji: '💥', gradient: ['#FAECE7', '#F5C4B3'] },
  mixed:  { label: 'Mixte',      emoji: '📚', gradient: ['#EAF3DE', '#C0DD97'] },
}

export const STATUS_META = {
  read:    { label: 'Lu',       color: '#3B6D11', bg: '#EAF3DE' },
  reading: { label: 'En cours', color: '#854F0B', bg: '#FEF3DC' },
  unread:  { label: 'Non lu',   color: '#5F5E5A', bg: '#f0f0ef' },
}
