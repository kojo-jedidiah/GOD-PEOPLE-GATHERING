# GOD PEOPLE GATHERING

Church website for **GOD PEOPLE GATHERING** — a community of faith focused on Scripture, covenants, and growing together in Christ.

## Features

- **Home Dashboard** — Daily affirmations & random/daily Bible verses
- **Member Login & Sign Up** — Client-side membership (localStorage)
- **Bible School**
  - Integrated Bible reader (all 66 books via public-domain WEB API)
  - Bible Study lessons on the covenants
  - Interactive Bible Quiz
- **Newsletter** — Image stories of Old Covenants (Noah, Abraham, Moses, Elijah, David, Solomon) and the New Covenant in Jesus
- **Inspired By God** — One-time PDF upload + downloadable book

## Project Structure

```
god-people-gathering/
├── index.html          # Home / Dashboard
├── login.html
├── signup.html
├── bible-school.html
├── newsletter.html
├── book.html           # Inspired By God
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── assets/             # (optional images, etc.)
└── README.md
```

## Deploy to Render (via GitHub)

### 1. Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `god-people-gathering`).
2. In this folder, run:

```bash
git init
git add .
git commit -m "Initial commit: GOD PEOPLE GATHERING church website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/god-people-gathering.git
git push -u origin main
```

### 2. Deploy as a Static Site on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Static Site**.
2. Connect your GitHub account and select the `god-people-gathering` repository.
3. Configure:
   - **Name:** `god-people-gathering` (or any name)
   - **Branch:** `main`
   - **Root Directory:** leave blank (or `.`)
   - **Build Command:** leave empty (no build needed)
   - **Publish Directory:** `.`  (or leave blank)
4. Click **Create Static Site**.

Render will give you a free URL like:
`https://god-people-gathering.onrender.com`

### Alternative: Manual upload

You can also zip this entire folder and upload it anywhere that serves static HTML (Netlify, GitHub Pages, Cloudflare Pages, etc.).

## Local Preview

Simply open `index.html` in a browser, or run a local server:

```bash
# Python
python -m http.server 8000

# Node (if you have npx)
npx serve .
```

Then visit `http://localhost:8000`.

## Notes

- Authentication and the uploaded “Inspired By God” PDF are stored in the visitor’s browser (`localStorage`). This is ideal for demos and small groups.
- Bible text is fetched from the free public-domain [bible-api.com](https://bible-api.com) (World English Bible).
- No backend or database is required.

---

**All glory to God.**  
GOD PEOPLE GATHERING © 2026
