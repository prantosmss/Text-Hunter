<div align="center">

<img src="icons/logo.svg" width="112" height="112" alt="Text Hunter logo">

# Text Hunter

**Point at a list. Hunt down every page. Get one clean Markdown file.**

A floating Chrome extension that turns any list of links into a single downloadable `.md`.

![version](https://img.shields.io/badge/version-1.3.1-6366f1?style=for-the-badge)
![manifest](https://img.shields.io/badge/manifest-v3-38bdf8?style=for-the-badge)
![output](https://img.shields.io/badge/output-markdown-22c55e?style=for-the-badge)
![deps](https://img.shields.io/badge/dependencies-zero-f59e0b?style=for-the-badge)

</div>

---

## ✨ What it does

Open a page that has a list of links (a table of contents, a chapter list, an index), click the floating button, point at the list, and press **Start**. Text Hunter visits every link, grabs each page's heading and paragraphs, and saves everything into one Markdown file.

```
# Chapter 1 – The Arrival

First paragraph…

---

# Chapter 2 – The Road West

First paragraph…
```

## 🚀 Features

| | |
|---|---|
| 🎯 **Element picker** | Hover and click the list on the page. Press **↑ / ↓** to move to a parent or child before you click. **Esc** cancels. |
| 🧬 **Similar-element finder** | Several lists that look alike? They're listed with checkboxes, link counts and a first-link preview. Tick the ones you want, or use *all* / *none*. |
| 🔭 **Hover to locate** | Hovering a row scrolls the page to that element and highlights it in orange. |
| 🚫 **Smart skipping** | Skips `File:` / `Image:` / `Category:` pages, images, PDFs, archives, media and same-page anchors. File-name-only paragraphs such as `File:Cover.jpg.jpg` are dropped too. |
| 🔁 **Polite fetching** | Configurable delay, retries and retry wait, so you don't hammer a server. |
| 📊 **Live progress** | Progress bar, a running log, and a **Cancel** button that still saves what was collected. |
| 🖱️ **Floating & draggable** | A small button you can drag anywhere. It remembers its position. Built in a Shadow DOM so site CSS can't break it. |

## 📦 Install

Text Hunter isn't on the Chrome Web Store, so load it unpacked:

1. Clone or download this repository.
2. Open `chrome://extensions` and switch on **Developer mode**.
3. Click **Load unpacked** and choose the project folder (the one containing `manifest.json`).
4. Open any page and look for the round indigo button in the bottom-right corner.

## 🧭 Usage

1. **Click the floating button** to open the panel.
2. **Pick element.** The panel hides; hover the list you want and click it.
3. If similar elements were found, **tick** the ones to include.
4. Adjust **delay / retries / filename** if you like.
5. Press **Start**. A `.md` file downloads when it finishes.

> **Tip:** if the summary says `0 links`, press **↑** while picking to select a parent that actually contains the links.

## ⚙️ How it works

- Links are collected from the selected element(s), de-duplicated, and filtered.
- Each page is fetched with `fetch()` from the current page, then parsed with `DOMParser`.
- The title comes from `h1[itemprop="name"]`, falling back to the first `<h1>`, then `<title>`.
- Every non-empty `<p>` becomes a paragraph. Pages are joined with `---`.

## 🔒 Privacy & permissions

- Only one permission: **`storage`**, used to remember the button's position.
- Nothing is sent anywhere. Text Hunter only requests the links *you* selected.
- No analytics, no remote code, no dependencies.

## ⚠️ Limitations

- Requests run from the page you're on, so they're subject to that site's same-origin / CORS rules. Lists that link to other domains may fail.
- Content that's rendered by JavaScript after load won't appear in the fetched HTML.
- Only paragraphs and the main heading are extracted (no images, tables or lists).
- Please respect each site's terms of service and `robots.txt`.

## 🗂️ Project layout

```
TextHunter/
├─ manifest.json
├─ content.js
├─ icons/
│  ├─ logo.svg
│  ├─ icon16.png
│  ├─ icon48.png
│  └─ icon128.png
├─ docs/
│  ├─ index.html      ← static landing page (GitHub Pages)
│  └─ logo.svg
└─ README.md
```

## 🌐 Landing page

A dependency-free landing page lives in [`docs/`](docs/index.html). To publish it, enable **GitHub Pages** in the repo settings and serve from the `/docs` folder of your default branch.

## 👤 Author

Made by **[prantosmss](https://github.com/prantosmss)** · pranto.smss.dev@gmail.com
