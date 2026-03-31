# GoLearn — Go Coding Practice Platform

30 problems across 11 Go topics, with a Monaco editor and sandboxed Go execution.

## Quick Start

```bash
cd backend
npm install
npm start
```

Then open **http://localhost:3001** in your browser. That's it — the backend serves the frontend too.

> **Requirements**: Node.js 18+ and Go 1.21+ installed and in your PATH.

---

## Project Structure

```
golearn/
├── backend/
│   ├── server.js       # Express API + static frontend serving + Go execution
│   └── package.json
├── frontend/
│   └── index.html      # Single-page app (Monaco editor, dark theme)
└── README.md
```

---

## Deploy to Free Hosting

### Backend → Render.com (serves both API and frontend)

1. Push the whole `golearn/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repo, then set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add env var: `NODE_ENV=production`

Render's free tier includes Go. Your app will be live at `https://your-app.onrender.com`.

> The frontend's API path is already relative (`/api/...`), so no URL changes needed after deploy.

---

## Problem Topics (30 total)

| # | Category | Problems |
|---|----------|----------|
| 1 | Introduction to Go | Hello World, Multiple Prints, Formatted Output |
| 2 | Language Basics | Variables, Constants, Type Conversion |
| 3 | Composite Types | Array Sum, Slice Operations, Map Word Count, Struct |
| 4 | Control Flow | FizzBuzz, Switch, Loop with Continue |
| 5 | Functions | Variadic Sum, Multiple Returns, Fibonacci Closure |
| 6 | Pointers & Memory | Pointer Basics, Pointer to Struct |
| 7 | Methods & Interfaces | Method on Struct, Shape Interface |
| 8 | Error Handling | Custom Error Type, Panic/Recover |
| 9 | Concurrency | Goroutines + WaitGroup, Channel Pipeline, Mutex |
| 10 | Standard Library | JSON Marshal, String Builder |
| 11 | Advanced Topics | Reflection, Generics, Stringer Interface |

## Sandbox Security

Each code submission runs in an isolated temp directory with:
- **5s timeout** — long-running code is killed
- **`GOPROXY=off`** — no network access during execution
- **Auto-cleanup** — temp dir deleted after each run
