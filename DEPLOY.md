# Bibliostack — Guide de déploiement rapide

## Structure du projet

```
bibliostack/
├── index.html
├── vite.config.js          ← PWA + service worker auto-généré
├── package.json
├── public/
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   └── icons/
│       ├── icon-192.png    ← À générer (voir ci-dessous)
│       └── icon-512.png
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── lib/
    │   ├── db.js            ← IndexedDB (idb)
    │   └── api.js           ← OpenLibrary + Google Books + INDUCKS
    ├── store/
    │   └── useStore.jsx     ← État global React
    ├── hooks/
    │   └── useScanner.js    ← ZXing code-barres
    ├── components/
    │   ├── BottomNav.jsx
    │   ├── Sidebar.jsx
    │   ├── BookCard.jsx
    │   ├── BookDetail.jsx
    │   └── ShelfModal.jsx
    └── pages/
        ├── HomeView.jsx
        ├── ShelfView.jsx
        ├── ScanView.jsx
        ├── StatsView.jsx
        ├── AlertsView.jsx
        └── AddBookModal.jsx
```

---

## 1. Installation locale

```bash
cd bibliostack
npm install
npm run dev
# → http://localhost:5173
```

---

## 2. Générer les icônes PWA

Créez un PNG 512×512 avec votre logo, puis :

```bash
# Avec sharp (npm i -g sharp-cli) :
sharp -i logo.png -o public/icons/icon-512.png resize 512 512
sharp -i logo.png -o public/icons/icon-192.png resize 192 192
cp public/icons/icon-192.png public/apple-touch-icon.png
```

Ou utilisez https://realfavicongenerator.net

---

## 3. Déployer sur Vercel (gratuit, 2 minutes)

```bash
# 1. Pousser sur GitHub
git init && git add . && git commit -m "init"
gh repo create bibliostack --public --push

# 2. Déployer
npx vercel --prod
# → Vercel détecte Vite automatiquement, aucune config requise
```

Votre PWA est en ligne sur `https://bibliostack-xxx.vercel.app`

---

## 4. Installer sur Android

1. Ouvrez l'URL dans **Chrome Android**
2. Chrome affiche une bannière "Ajouter à l'écran d'accueil"
3. Ou : menu ⋮ → "Installer l'application"
4. L'app s'installe avec son icône, mode plein écran, accès caméra ✓

---

## 5. Activer le scanner code-barres (réel)

Le hook `useScanner.js` utilise **ZXing-js** — déjà installé.
Il fonctionne dès que vous accédez au site en **HTTPS** (obligatoire pour getUserMedia).

En local : `npm run dev` → Vite génère automatiquement un certificat auto-signé avec :
```bash
npm run dev -- --https
```

---

## 6. Activer INDUCKS (backend requis)

INDUCKS n'a pas d'API CORS-friendly. Créez une **Vercel Serverless Function** :

```
bibliostack/
└── api/
    └── inducks.js    ← votre proxy
```

```js
// api/inducks.js
export default async function handler(req, res) {
  const { q } = req.query
  const html = await fetch(`https://coa.inducks.org/search.php?q=${encodeURIComponent(q)}`)
    .then(r => r.text())
  // Parser le HTML et retourner du JSON
  // (utiliser cheerio ou regex simples)
  res.json({ results: [] }) // À implémenter
}
```

Dans `src/lib/api.js`, décommentez :
```js
const res = await fetch(`/api/inducks?q=${encodeURIComponent(query)}`)
return res.json()
```

---

## 7. Activer Supabase (sync cloud optionnel)

```bash
npm install @supabase/supabase-js
```

1. Créer un projet sur https://supabase.com (gratuit)
2. Créer les tables `shelves` et `books` (même schéma que `src/lib/db.js`)
3. Ajouter dans `.env` :
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
4. Modifier `src/lib/db.js` pour écrire en double (IndexedDB + Supabase)

---

## Coût total en production

| Service       | Coût      | Usage                    |
|---------------|-----------|--------------------------|
| Vercel        | Gratuit   | Hébergement + fonctions  |
| Supabase      | Gratuit   | 500 MB DB, 2 GB stockage |
| Open Library  | Gratuit   | API publique             |
| Google Books  | Gratuit   | 1000 req/jour            |
| INDUCKS       | Gratuit   | Via votre proxy Vercel   |
