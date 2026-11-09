/**
 * Text Hunter
 * Author: prantosmss
 */
(function () {
  if (window.__floatingListScraper) return;
  window.__floatingListScraper = true;

  const STORE_KEY = "fls_state";
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // ---------- Shadow DOM host ----------
  const host = document.createElement("div");
  host.style.cssText = "all:initial;position:fixed;z-index:2147483647;";
  const root = host.attachShadow({ mode: "open" });

  root.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
      .fab {
        width: 48px; height: 48px; border-radius: 50%; border: none; cursor: grab;
        background: #4f46e5; color: #fff; font-size: 22px; line-height: 48px; text-align: center;
        box-shadow: 0 4px 14px rgba(0,0,0,.35); user-select: none; touch-action: none;
      }
      .fab:active { cursor: grabbing; }
      .panel {
        position: absolute; width: 340px; background: #1f2230; color: #e8e9f0;
        border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.45); padding: 12px;
        display: none; font-size: 13px;
      }
      .panel.open { display: block; }
      .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-weight: 600; }
      .head button { background: none; border: none; color: #aaa; font-size: 18px; cursor: pointer; }
      label { display: block; margin: 8px 0 3px; color: #b5b8c9; font-size: 12px; }
      textarea, input[type=number], input[type=text] {
        width: 100%; background: #12141d; color: #e8e9f0; border: 1px solid #3a3e55;
        border-radius: 6px; padding: 6px; font-size: 12px; font-family: ui-monospace, Consolas, monospace;
      }
      textarea { height: 70px; resize: vertical; }
      .pickrow { display: flex; gap: 8px; align-items: center; }
      #pick { background: #0ea5e9; color: #fff; border: none; border-radius: 6px; padding: 7px 10px; cursor: pointer; font-weight: 600; font-size: 12px; white-space: nowrap; }
      #picked { font: 11px ui-monospace, Consolas, monospace; color: #b5b8c9; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      #picked.ok { color: #4ade80; }
      [hidden] { display: none !important; }
      .chk { display: flex; gap: 6px; align-items: center; cursor: pointer; }
      .chk input { margin: 0; }
      .matches { margin-top: 8px; background: #12141d; border-radius: 6px; padding: 6px; }
      .mhead { display: flex; justify-content: space-between; font-size: 11px; color: #b5b8c9; margin-bottom: 4px; }
      .mhead a { color: #38bdf8; cursor: pointer; }
      .mlist { max-height: 110px; overflow: auto; }
      .mrow { display: flex; gap: 6px; align-items: flex-start; padding: 4px; border-radius: 4px; cursor: pointer; font-size: 11px; }
      .mrow:hover { background: #262a3d; }
      .mrow input { margin: 2px 0 0; flex: none; }
      .mrow .mt { overflow: hidden; }
      .mrow .mt b { display: block; font: 600 11px ui-monospace, Consolas, monospace; color: #e8e9f0; }
      .mrow .mt i { display: block; font-style: normal; color: #8a8ea6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .row { display: flex; gap: 8px; }
      .row > div { flex: 1; }
      .btns { display: flex; gap: 8px; margin-top: 10px; }
      .btns button {
        flex: 1; padding: 8px; border: none; border-radius: 6px; cursor: pointer;
        font-weight: 600; font-size: 13px;
      }
      #start { background: #4f46e5; color: #fff; }
      #cancel { background: #3a3e55; color: #e8e9f0; }
      button:disabled { opacity: .45; cursor: not-allowed; }
      .bar { height: 6px; background: #12141d; border-radius: 3px; margin-top: 10px; overflow: hidden; }
      .bar > div { height: 100%; width: 0; background: #22c55e; transition: width .2s; }
      .log {
        margin-top: 8px; height: 120px; overflow: auto; background: #12141d; border-radius: 6px;
        padding: 6px; font: 11px/1.4 ui-monospace, Consolas, monospace; white-space: pre-wrap;
      }
      .err { color: #f87171; } .warn { color: #fbbf24; } .ok { color: #4ade80; }
    </style>
    <div class="fab" id="fab" title="Text Hunter (drag to move)">⤓</div>
    <div class="panel" id="panel">
      <div class="head"><span>Text Hunter <small style="font-weight:400;color:#8a8ea6;font-size:11px">by prantosmss</small></span><button id="close" title="Close">×</button></div>
      <label>List element (the one containing the links)</label>
      <div class="pickrow">
        <button id="pick">⌖ Pick element</button>
        <span id="picked">Nothing picked</span>
      </div>
      <div class="matches" id="matches" hidden>
        <div class="mhead">
          <span id="mcount"></span>
          <span><a id="mall">all</a> · <a id="mnone">none</a></span>
        </div>
        <div class="mlist" id="mlist"></div>
      </div>
      <label class="chk"><input type="checkbox" id="skip" checked> Skip file/media links (File:…, images, PDFs…)</label>
      <div class="row">
        <div><label>Delay (ms)</label><input type="number" id="delay" value="1000" min="0"></div>
        <div><label>Retries</label><input type="number" id="retries" value="3" min="1"></div>
        <div><label>Retry wait (ms)</label><input type="number" id="retryDelay" value="2000" min="0"></div>
      </div>
      <label>Output filename</label>
      <input type="text" id="filename" value="scraped_content.md">
      <div class="btns">
        <button id="start">Start</button>
        <button id="cancel" disabled>Cancel</button>
      </div>
      <div class="bar"><div id="progress"></div></div>
      <div class="log" id="log"></div>
    </div>
  `;
  document.documentElement.appendChild(host);

  const $ = (id) => root.getElementById(id);
  const fab = $("fab"), panel = $("panel"), logEl = $("log");
  let cancelled = false, running = false;

  // ---------- Position / state persistence ----------
  const store = {
    get: () => new Promise((r) => {
      try { chrome.storage.local.get(STORE_KEY, (o) => r((o && o[STORE_KEY]) || {})); } catch { r({}); }
    }),
    set: (v) => { try { chrome.storage.local.set({ [STORE_KEY]: v }); } catch {} },
  };
  let state = { right: 24, bottom: 24 };

  function applyPosition() {
    host.style.right = state.right + "px";
    host.style.bottom = state.bottom + "px";
    // open panel upward/leftward so it stays on screen
    panel.style.right = "0";
    panel.style.bottom = "58px";
  }

  store.get().then((s) => {
    state = Object.assign(state, s);
    applyPosition();
  });
  applyPosition();

  // ---------- Dragging ----------
  let drag = null;
  fab.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, right: state.right, bottom: state.bottom, moved: false };
    fab.setPointerCapture(e.pointerId);
  });
  fab.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    if (!drag.moved) return;
    state.right = Math.max(0, Math.min(window.innerWidth - 48, drag.right - dx));
    state.bottom = Math.max(0, Math.min(window.innerHeight - 48, drag.bottom - dy));
    applyPosition();
  });
  fab.addEventListener("pointerup", () => {
    if (!drag) return;
    if (drag.moved) store.set({ ...state });
    else panel.classList.toggle("open");
    drag = null;
  });
  $("close").addEventListener("click", () => panel.classList.remove("open"));

  // ---------- Logging ----------
  function log(msg, cls) {
    const line = document.createElement("div");
    if (cls) line.className = cls;
    line.textContent = msg;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  // ---------- Resolve URLs ----------
  function linksIn(el) {
    const links = el.matches && el.matches("a[href]") ? [el] : Array.from(el.querySelectorAll("a[href]"));
    return [...new Set(links.map((a) => a.href).filter((h) => /^https?:/i.test(h) && !shouldSkip(h)))];
  }

  // ---------- Skip file / media / non-content links ----------
  const FILE_EXT = /\.(jpe?g|png|gif|webp|svg|bmp|ico|tiff?|avif|pdf|zip|rar|7z|mp3|mp4|webm|ogg|wav|mkv|avi|mov|docx?|xlsx?|pptx?|exe|apk|epub)$/i;
  const WIKI_NS = /^(File|Image|Media|Special|Category|Template):/i;
  // a paragraph that is just a file name, e.g. "File:OutlawsFromTheWest1.jpg.jpg"
  const FILE_TEXT = /^(?:(?:File|Image):)?\S+\.(?:jpe?g|png|gif|webp|svg|bmp)(?:\.\w+)?$/i;

  function shouldSkip(href) {
    if (!root.getElementById("skip").checked) return false;
    let u;
    try { u = new URL(href); } catch { return true; }
    // same-page anchors
    if (u.hash && u.href.split("#")[0] === location.href.split("#")[0]) return true;
    let path = u.pathname;
    try { path = decodeURIComponent(path); } catch { /* keep raw */ }
    const last = path.split("/").filter(Boolean).pop() || "";
    const title = u.searchParams.get("title") || "";
    return FILE_EXT.test(path) || WIKI_NS.test(last) || WIKI_NS.test(title) || FILE_EXT.test(title);
  }

  // ---------- Element picker ----------
  let pickedEl = null;

  function describe(el) {
    let s = el.tagName.toLowerCase();
    if (el.id) s += "#" + el.id;
    else if (typeof el.className === "string" && el.className.trim())
      s += "." + el.className.trim().split(/\s+/).slice(0, 2).join(".");
    return s;
  }

  // ---------- Similar elements ----------
  let candidates = []; // [{ el, box }]

  function selectorFor(el) {
    const cls = typeof el.className === "string"
      ? el.className.trim().split(/\s+/).filter(Boolean).map((c) => "." + CSS.escape(c)).join("")
      : "";
    return el.tagName.toLowerCase() + cls;
  }

  function findSimilar(el) {
    let list = [];
    try {
      let sel = selectorFor(el);
      // class-less element: narrow by parent so we don't match every <ul> on the page
      if (sel === el.tagName.toLowerCase() && el.parentElement) sel = selectorFor(el.parentElement) + " > " + sel;
      list = Array.from(document.querySelectorAll(sel));
    } catch { /* bad selector: fall through */ }
    list = list.filter((x) => x === el || (!host.contains(x) && linksIn(x).length > 0));
    if (!list.includes(el)) list.unshift(el);
    return list;
  }

  const hl = document.createElement("div");
  hl.style.cssText =
    "position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #f59e0b;" +
    "background:rgba(245,158,11,.2);border-radius:3px;display:none;";
  document.documentElement.appendChild(hl);

  let hoverEl = null, hoverTimer = null;

  function drawHighlight() {
    if (!hoverEl || !hoverEl.isConnected) { hl.style.display = "none"; return; }
    const r = hoverEl.getBoundingClientRect();
    Object.assign(hl.style, {
      display: "block", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px",
    });
  }

  // Scroll the page to the hovered element and keep the highlight glued to it while scrolling.
  function showHighlight(el) {
    hoverEl = el;
    drawHighlight();
    clearTimeout(hoverTimer);
    // short delay so sweeping the mouse down the list doesn't make the page jump around
    hoverTimer = setTimeout(() => {
      if (hoverEl === el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 150);
  }

  function hideHighlight() {
    clearTimeout(hoverTimer);
    hoverEl = null;
    hl.style.display = "none";
  }

  window.addEventListener("scroll", drawHighlight, true);
  window.addEventListener("resize", drawHighlight);

  function selectedEls() {
    if (!candidates.length) return pickedEl ? [pickedEl] : [];
    return candidates.filter((c) => c.box.checked && c.el.isConnected).map((c) => c.el);
  }

  function allUrls() {
    return [...new Set(selectedEls().flatMap(linksIn))];
  }

  function updateSummary() {
    candidates.forEach((c) => { if (c.box) c.keep = c.box.checked; });
    const els = selectedEls();
    const n = allUrls().length;
    const label = $("picked");
    label.textContent = els.length
      ? `${els.length} element${els.length === 1 ? "" : "s"} — ${n} link${n === 1 ? "" : "s"}`
      : "Nothing selected";
    label.title = label.textContent;
    label.className = n ? "ok" : "";
    $("mcount").textContent = `${candidates.length} similar elements found`;
  }

  function renderMatches() {
    const wrap = $("matches"), listEl = $("mlist");
    listEl.textContent = "";
    if (candidates.length < 2) { wrap.hidden = true; return; }
    wrap.hidden = false;

    candidates.forEach((c, i) => {
      const links = linksIn(c.el);
      const row = document.createElement("label");
      row.className = "mrow";
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = c.keep !== undefined ? c.keep : c.el === pickedEl;
      c.box = box;
      const txt = document.createElement("div");
      txt.className = "mt";
      const b = document.createElement("b");
      b.textContent = `#${i + 1} ${describe(c.el)} — ${links.length} link${links.length === 1 ? "" : "s"}`;
      const it = document.createElement("i");
      const first = links[0] ? (c.el.querySelector("a[href]") || c.el).textContent.trim() : "";
      it.textContent = first || (links[0] || "no links");
      txt.append(b, it);
      row.append(box, txt);
      row.addEventListener("mouseenter", () => showHighlight(c.el));
      row.addEventListener("mouseleave", hideHighlight);
      box.addEventListener("change", updateSummary);
      listEl.appendChild(row);
    });
  }

  $("skip").addEventListener("change", () => {
    if (!pickedEl) return;
    updateSummary();                       // remember ticks
    if (candidates.length) renderMatches(); // refresh per-row link counts
    updateSummary();
  });

  $("mall").addEventListener("click", () => { candidates.forEach((c) => (c.box.checked = true)); updateSummary(); });
  $("mnone").addEventListener("click", () => { candidates.forEach((c) => (c.box.checked = false)); updateSummary(); });

  function setPicked(el) {
    pickedEl = el;
    candidates = findSimilar(el).map((x) => ({ el: x, box: null }));
    renderMatches();
    if (candidates.length < 2) candidates = [];
    updateSummary();
    if (candidates.length > 1) log(`Found ${candidates.length} similar elements. Tick the ones you want.`, "ok");
    else if (!linksIn(el).length) log("That element has no links. Try picking a parent (↑ while hovering).", "warn");
  }

  function startPicking() {
    if (running) return;
    panel.classList.remove("open");

    const box = document.createElement("div");
    box.style.cssText =
      "position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #0ea5e9;" +
      "background:rgba(14,165,233,.18);border-radius:3px;transition:all .05s;";
    const tip = document.createElement("div");
    tip.style.cssText =
      "position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:2147483647;" +
      "background:#1f2230;color:#fff;padding:6px 12px;border-radius:6px;font:12px system-ui,sans-serif;" +
      "pointer-events:none;box-shadow:0 4px 14px rgba(0,0,0,.4);";
    tip.textContent = "Click the list • ↑ parent • ↓ child • Esc cancel";
    document.documentElement.append(box, tip);

    let current = null;
    let childStack = [];

    const draw = () => {
      if (!current) return;
      const r = current.getBoundingClientRect();
      box.style.left = r.left + "px"; box.style.top = r.top + "px";
      box.style.width = r.width + "px"; box.style.height = r.height + "px";
      tip.textContent = `${describe(current)} — ${linksIn(current).length} links • ↑ parent • ↓ child • Esc cancel`;
    };

    const onMove = (e) => {
      const el = e.target;
      if (!el || el === host || host.contains(el) || el === current) return;
      current = el; childStack = [];
      draw();
    };
    const stop = (e) => { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); };
    const finish = (el) => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mousedown", stop, true);
      document.removeEventListener("mouseup", stop, true);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", draw, true);
      box.remove(); tip.remove();
      panel.classList.add("open");
      if (el) setPicked(el);
    };
    const onClick = (e) => { stop(e); finish(current); };
    const onKey = (e) => {
      if (e.key === "Escape") { stop(e); finish(null); }
      else if (e.key === "ArrowUp" && current && current.parentElement &&
               current.parentElement !== document.documentElement) {
        stop(e); childStack.push(current); current = current.parentElement; draw();
      } else if (e.key === "ArrowDown" && childStack.length) {
        stop(e); current = childStack.pop(); draw();
      }
    };

    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("mousedown", stop, true);
    document.addEventListener("mouseup", stop, true);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", draw, true);
  }

  $("pick").addEventListener("click", startPicking);

  // ---------- Main scrape ----------
  async function run() {
    if (!selectedEls().length) {
      log("Pick (and tick) at least one list element first.", "warn");
      return;
    }

    const DELAY_MS = Math.max(0, +$("delay").value || 0);
    const MAX_RETRIES = Math.max(1, +$("retries").value || 1);
    const RETRY_DELAY_MS = Math.max(0, +$("retryDelay").value || 0);
    const filename = ($("filename").value.trim() || "scraped_content.md");

    const urls = allUrls();
    if (!urls.length) { log("No links found in the selected element(s).", "err"); return; }

    running = true; cancelled = false;
    $("start").disabled = true; $("cancel").disabled = false;
    $("progress").style.width = "0";
    log(`Found ${urls.length} link(s). Starting...`, "ok");

    const blocks = [];
    for (let i = 0; i < urls.length; i++) {
      if (cancelled) { log("Cancelled.", "warn"); break; }
      const url = urls[i];
      let html = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        if (cancelled) break;
        try {
          log(`[${i + 1}/${urls.length}] ${url} (try ${attempt}/${MAX_RETRIES})`);
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          html = await res.text();
          break;
        } catch (err) {
          log(`  attempt ${attempt} failed: ${err.message}`, "warn");
          if (attempt < MAX_RETRIES) await delay(RETRY_DELAY_MS);
          else log(`  skipped after ${MAX_RETRIES} attempts`, "err");
        }
      }

      if (html) {
        try {
          const doc = new DOMParser().parseFromString(html, "text/html");
          const h1 = doc.querySelector('h1[itemprop="name"]') || doc.querySelector("h1");
          // textContent: innerText is unreliable on detached/parsed documents
          const title = (h1 && h1.textContent.trim()) || doc.title || `Page ${i + 1}`;
          const paras = Array.from(doc.querySelectorAll("p"))
            .map((p) => p.textContent.trim())
            .filter((t) => t && !($("skip").checked && FILE_TEXT.test(t)));
          blocks.push([`# ${title}`, ...paras].join("\n\n"));
        } catch (e) {
          log(`  parse error: ${e.message}`, "err");
        }
      }

      $("progress").style.width = `${Math.round(((i + 1) / urls.length) * 100)}%`;
      await delay(DELAY_MS);
    }

    if (blocks.length) {
      const blob = new Blob([blocks.join("\n\n---\n\n")], { type: "text/markdown;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      log(`Done! Saved ${blocks.length} page(s) to '${filename}'.`, "ok");
    } else {
      log("No content was collected.", "err");
    }

    running = false;
    $("start").disabled = false; $("cancel").disabled = true;
  }

  $("start").addEventListener("click", () => { if (!running) run(); });
  $("cancel").addEventListener("click", () => { cancelled = true; });
})();
