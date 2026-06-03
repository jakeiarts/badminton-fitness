# 🏸 Badminton Fitness — Personal Training App

A lightweight, mobile-first training app for a returning badminton player. It organises
strength, running, footwork and recovery into a simple weekly plan, tracks your progress,
and works completely offline. **No backend, no login, no database, no build step.**

All your data is stored privately in your own browser (`localStorage`). Nothing is ever
uploaded anywhere.

---

## Contents

| File | What it is |
|------|------------|
| `index.html` | The app shell (open this to run the app) |
| `styles.css` | All styling (light/dark, mobile-first, print view) |
| `app.js` | **All logic and all workout data** — edit here to change the program |
| `manifest.json` | PWA manifest (makes it installable) |
| `service-worker.js` | Offline caching |
| `icon.svg`, `icon-192.png`, `icon-512.png`, `icon-180.png` | App icons |
| `README.md` | This file |

---

## 1. How to open it on your PC

You have two options.

### Option A — just double-click (simplest)
Double-click **`index.html`**. It opens in your default browser and works immediately.
Everything functions this way **except** the offline service worker, which browsers disable
for `file://` pages. That's fine — the app still saves all your data and runs normally.

### Option B — run a tiny local server (enables full offline/PWA)
A local server lets the service worker register so you can install the app and use it
offline. From the project folder (`D:\training`), run **one** of these:

```powershell
# If you have Node.js (you do):
npx serve .
# then open the printed URL, e.g. http://localhost:3000

# …or with Python 3:
python -m http.server 8000
# then open http://localhost:8000
```

> Tip: In Chrome/Edge, an **Install** icon appears in the address bar when served over
> http/https — click it to install the app like a normal program.

---

## 2. How to use it on your phone

### Quickest: serve from your PC and open on your phone (same Wi-Fi)
1. On your PC run `npx serve .` (or `python -m http.server 8000`).
2. Find your PC's local IP (`ipconfig` on Windows → "IPv4 Address", e.g. `192.168.1.20`).
3. On your phone's browser go to `http://192.168.1.20:3000` (use the port shown).
4. **Add to Home Screen:**
   - **iPhone (Safari):** Share button → *Add to Home Screen*.
   - **Android (Chrome):** ⋮ menu → *Add to Home screen* / *Install app*.

It now opens full-screen like a native app, works offline, remembers your data, and the
footwork timer can beep and vibrate.

### Even easier long-term: publish it (see next section)
Once it's on GitHub Pages you can just bookmark the URL on your phone and install from there.

---

## 3. How to publish it free with GitHub Pages

This makes the app available at a permanent URL you can bookmark on any device.

1. Create a free account at <https://github.com> if you don't have one.
2. Create a new **public** repository, e.g. `badminton-fitness`.
3. Upload **all the files in this folder** to the repository
   (drag-and-drop on the GitHub website is fine, or use `git`):

   ```powershell
   cd D:\training
   git init
   git add .
   git commit -m "Badminton fitness app v1"
   git branch -M main
   git remote add origin https://github.com/<your-username>/badminton-fitness.git
   git push -u origin main
   ```

4. In the repository, go to **Settings → Pages**.
5. Under **Build and deployment → Source**, choose **Deploy from a branch**.
6. Select branch **`main`** and folder **`/ (root)`**, then **Save**.
7. Wait ~1 minute. Your app appears at:

   ```
   https://<your-username>.github.io/badminton-fitness/
   ```

8. Open that URL on your phone and **Add to Home Screen / Install**. Because it's served
   over HTTPS, the service worker registers and the app works offline after the first visit.

> **Updating later:** change a file, then commit & push again
> (`git add . && git commit -m "update" && git push`). To force the offline cache to
> refresh, bump `CACHE_VERSION` in `service-worker.js` (e.g. `badfit-v1` → `badfit-v2`).

---

## 4. Where the workout data lives (how to edit exercises & rules)

**Everything you'd want to change is at the top of [`app.js`](app.js) in the `DATA` object.**
It is plain JavaScript — edit the text, save, refresh the page.

Inside `DATA` you'll find:

| Key | What it controls |
|-----|------------------|
| `DATA.library` | Every exercise: name, category, `tags` (used by the filters), instructions, beginner/standard/harder variations, reps, common mistakes, and why it helps badminton. |
| `DATA.sessions.A` / `DATA.sessions.B` | The two strength workouts (exercises, sets/reps, optional items). |
| `DATA.runLevels` | The running progression levels (the step lists). |
| `DATA.footworkLevels` | Footwork levels: rounds, work seconds, rest seconds, notes (the timer reads these). |
| `DATA.weekDefault` | The default weekly schedule. |
| `DATA.milestones` | The starting milestone cards. |

### Common edits

- **Change a session's exercises:** edit the `items` array in `DATA.sessions.A` (or `B`).
  Each item's `ref` must match an exercise `name` in `DATA.library`. `cat` decides which
  exercises appear in the in-app "swap" dropdown.
- **Add a new exercise:** copy one object in `DATA.library`, change the fields, and give it
  appropriate `tags` from: `none, backpack, band, rope, chair` (equipment),
  `lower, upper, core, mobility, footwork` (area), `beginner, intermediate, advanced` (level).
- **Add a footwork level:** add an object to `DATA.footworkLevels` with
  `{ n, title, rounds, work, rest, note }`. The interval timer will use it automatically.
- **Change the progression suggestions:** the rule logic is in the `buildSuggestions()`
  function further down in `app.js` (search for it). It only *suggests* — you always approve
  changes yourself.

No build or install is needed — just save the file and reload the page.

---

## Privacy, backups & resetting

- Your data lives only in this browser. **Use Settings → Export JSON backup** regularly,
  and keep the file somewhere safe.
- **Import JSON backup** restores from a previously exported file (e.g. when moving to a new
  phone or browser).
- **Reset all stored data** (Settings) wipes everything after a double confirmation.

---

## Accessibility & design notes

- Semantic HTML, keyboard-focusable controls, visible focus rings, and a skip link.
- Mobile-first layout with a sticky bottom navigation bar; centred max-width layout on desktop.
- Large touch targets (≥48px), one-handed friendly forms, and cards instead of tiny tables on phones.
- Light/dark theme toggle (top bar) and a print-friendly view (🖨️ button expands everything).

---

## ⚠️ Safety

This app provides general training organisation and educational information. **It is not a
medical diagnosis or a substitute for advice from a qualified clinician.** Do not train
through sharp pain. See the in-app **Guidance → Safety** section for warning signs and when
to seek medical advice.
