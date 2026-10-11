# Exam Prep Platform — Bihar STET · BPSC TRE · UGC NET · GATE CS · College Semester

A complete practice + CBT-exam web app (plain HTML/CSS/JavaScript — **no build step, no framework**).

* **1,143 questions** — 1,001 for Bihar STET/BPSC TRE; every one of the 104 Bihar STET syllabus topics has at least 8 questions
* Practice mode with instant feedback, confetti rewards, wrong-question revision, bookmarks, daily challenge
* Real-exam CBT mode (STET 130 Q / TRE / UGC NET 150 Q / GATE 65 Q / College) with timer, palette, review marks
* Webcam proctoring + anti-copy/anti-screenshot guard (consent based) and auto-email of the recording (via Google Apps Script)
* "Vidya" AI study chatbot (through a secure serverless proxy)

---

## 1. Folder map

```
index.html                  page shell (loads the files below)
css/styles.css              all styling
js/data/syllabus.js         Bihar STET syllabus + topic lists          (loaded 1st)
js/data/questions.js        THE QUESTION BANK — edit/add questions here (loaded 2nd)
js/app.js                   all app logic (exam profiles, CBT, proctoring, chatbot, UI)  (loaded 3rd)
api/chat.js                 Vercel serverless function  → Vidya chatbot proxy
netlify/functions/chat.js   same thing for Netlify
proctoring-mail-backend.gs  Google Apps Script that saves videos to Drive + emails you
scripts/check-questions.js  validates the question bank   →  npm run check
scripts/build-single-file.js  bundles everything into one HTML →  npm run build:single
```

## 2. Open it in VS Code (5 minutes)

1. Install **Node.js** (LTS) and **VS Code**. In VS Code install the extension **Live Server**.
2. Unzip the project, then **File → Open Folder…** and choose `stet-prep-platform`.
3. Right-click `index.html` → **Open with Live Server**. The site opens at `http://127.0.0.1:5500`.
   * The camera works on `localhost` (browsers allow it). Progress is saved in the browser (localStorage).
4. To also test the chatbot locally (needs the API function):
   ```bash
   npm i -g vercel
   echo ANTHROPIC_API_KEY=your-key-here > .env.local
   vercel dev
   ```
   Open the URL it prints (usually http://localhost:3000).
5. Check the question bank any time: `npm run check` (add a number to demand more per topic, e.g. `node scripts/check-questions.js 10`).

## 3. Put it on GitHub (so you can open/update it from anywhere)

```bash
git init
git add .
git commit -m "Exam prep platform"
# create an EMPTY repo on github.com first (choose Private), then:
git remote add origin https://github.com/YOUR-NAME/stet-prep-platform.git
git branch -M main
git push -u origin main
```

## 4. Deploy to the cloud (free tiers are enough to start)

### Option A — Vercel (recommended: includes the chatbot)
1. Go to **vercel.com** → sign in with GitHub → **Add New → Project** → import the repo.
2. Framework preset: **Other**. Leave build/output settings empty. Open **Environment Variables** and add  
   `ANTHROPIC_API_KEY` = *your key from console.anthropic.com*  (optional: `ANTHROPIC_MODEL`, `ALLOWED_ORIGIN`).
3. Click **Deploy**. You get `https://your-project.vercel.app` — HTTPS, so the **camera works**, on any phone or laptop.
4. Every `git push` redeploys automatically.

### Option B — Netlify
1. **netlify.com** → **Add new site → Import from Git** → pick the repo (no build command, publish directory `.`).
2. **Site settings → Environment variables** → add `ANTHROPIC_API_KEY`.
3. Deploy. `netlify.toml` already routes `/api/chat` to the function.

### Option C — GitHub Pages or Netlify drag-and-drop (static only)
Everything works **except the chatbot** (no server function). To keep Vidya, deploy the project once on Vercel and in `js/app.js` set  
`const VIDYA_ENDPOINT='https://your-project.vercel.app/api/chat';`

## 5. Settings you may want to change (all in `js/app.js`)

| What | Where |
|---|---|
| Recording e-mail address shown in the consent text | `PROCTOR.email` |
| Google Apps Script URL (mail backend) | `PROCTOR.endpoint` |
| Warnings before auto-submit | `PROCTOR.maxViolations` (default 5) |
| Chatbot proxy URL | `VIDYA_ENDPOINT` (default `/api/chat`) |
| Exam patterns (questions, marks, minutes, negative marking) | `PROFILES` → each profile's `cbt` |

**Mail backend setup:** open `proctoring-mail-backend.gs` and follow the steps at the top (deploy as a Web app, run `authorizeAndTest` once, then paste the `/exec` URL into `PROCTOR.endpoint`).

## 6. Adding / editing questions

Edit `js/data/questions.js`. One question looks like:

```js
{id:"my1", t:"Operating Systems", sub:"u5:3", d:3, ty:"Conceptual",
 q:"Which condition is NOT necessary for deadlock?",
 o:["Preemption","Mutual exclusion","Hold and wait","Circular wait"], a:0,
 e:"Deadlock needs NO preemption; preemption would break it."}
```
* `t` = topic name, `sub` = syllabus point (`u5:3` = Unit 5, 4th bullet — the same order as in `syllabus.js`)
* `d` = 1 Easy · 2 Moderate · 3 Hard · 4 Very Hard, `a` = index of the correct option (0–3)
* In `q`/`o`/`e` write `&lt;` and `&gt;` instead of `<` and `>` (the text is inserted as HTML).
* Add `g:1` for GATE-level questions. Run `npm run check` after editing.

## 7. Things to know (honest notes)

* **Progress is stored in each browser (localStorage).** The app is reachable from anywhere, but your progress on a phone and on a laptop are separate. Syncing across devices needs a login + database (e.g. Firebase/Supabase) — not included yet.
* **Your Apps Script URL is visible to anyone who opens the site** (it must be in the page). Someone could upload junk to your Drive. If that happens, delete the deployment and create a new one, then update `PROCTOR.endpoint`.
* **The chatbot costs money** per message (your Anthropic key). The function limits message length and history; for a public site also set a spending limit in the Anthropic console and consider rate limiting.
* **Proctoring is a deterrent, not a guarantee.** A browser cannot truly block screenshots or phone photos. Tell students about the recording (the consent box does) and follow the privacy rules that apply to you.
* **Exam patterns for TRE, UGC NET, GATE and the College test are my best-known versions** — verify them against the official notices before relying on them. Previous-year papers are **not** included (they were not available to verify).
* Questions are original practice questions, labelled as such — not official past papers.
