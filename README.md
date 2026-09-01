# Portfolio Builder

A full-stack app for creating, editing, and previewing a personal portfolio website.

- **Backend**: Node.js + Express, storing portfolios in a simple JSON file (`server/data/portfolios.json` — created automatically). Swap in a real database later without touching the frontend if you want.
- **Frontend**: React + Vite. Split "desk" view — a blueprint-style editor on the left, a live paper-style preview on the right — plus a shareable read-only preview link.

## Features
- Create a new portfolio, edit it, and see the finished page update as you type (auto-saves ~1s after you stop typing)
- Sections: identity + avatar, bio, skills (tag input), projects (title/description/link/tags, add & remove), contact & socials
- "Copy preview link" gives a standalone, read-only URL (`#/view/<id>`) you can send to anyone — no login required
- A home screen lists every portfolio you've created so you can come back and keep editing
- Responsive: the split view collapses into Edit/Preview tabs on small screens
- **✨ AI-generated tagline & bio** — one click fills in a professional tagline and "About Me" bio from the name, title, location, and skills already entered, using Google's free Gemini 2.5 Flash model

## Running it locally

You need Node.js 18+ installed.

**1. Get a free Gemini API key (needed for the "Generate with AI" button)**
- Go to https://aistudio.google.com/apikey and sign in with a Google account
- Click "Create API key" — it's free, no credit card needed
- Copy `server/.env.example` to `server/.env` and paste your key:
  ```
  GEMINI_API_KEY=your_key_here
  ```
- If you skip this, the app still works fully — you just won't see the "Generate with AI" button do anything, and it'll show a message asking you to add the key.

**2. Start the backend**
```bash
cd server
npm install
npm start
```
This runs the API at `http://localhost:4000`.

**3. Start the frontend** (in a second terminal)
```bash
cd client
npm install
npm run dev
```
This runs the app at `http://localhost:5173` and proxies `/api` calls to the backend.

Open `http://localhost:5173`, click **"Start a new portfolio"**, and start typing.

## Building for production
```bash
cd client
npm run build
```
This outputs static files to `client/dist`, which you can serve with any static host — just make sure `/api` requests reach your running backend (e.g. via a reverse proxy or by setting the API base URL in `client/src/api.js`).

## Project structure
```
portfolio-builder/
├── server/
│   ├── index.js          # Express API (create/read/update/delete portfolios + AI generate)
│   ├── data/              # auto-created JSON "database"
│   ├── .env.example       # copy to .env and add your GEMINI_API_KEY
│   └── package.json
└── client/
    ├── index.html
    ├── vite.config.js     # dev proxy for /api -> localhost:4000
    └── src/
        ├── main.jsx
        ├── App.jsx        # hash-based routing: home / edit / view
        ├── api.js         # fetch wrapper for the backend
        ├── styles.css      # design system (blueprint editor + paper preview)
        └── components/
            ├── Home.jsx     # list + create portfolios
            ├── Builder.jsx  # split editor/preview screen, autosave, share link
            ├── Editor.jsx   # the form (left/blueprint side)
            └── Preview.jsx  # the rendered portfolio (right/paper side, and the standalone view)
```

## Ideas for extending it
- Swap the JSON file for SQLite/MySQL/Firebase (only `server/index.js` needs to change)
- Add authentication so each user only sees their own portfolios
- Add a theme picker (the data model already has a `theme` field, currently unused)
- Add drag-to-reorder for projects and skills
- Export the standalone preview as a static HTML page for hosting elsewhere
- Extend the AI feature to also suggest/improve individual project descriptions
