let data = {};
let muted = false;

/* =========================
   DEFAULT MODE = AUTO REVIEW
   (تو بعداً اگر خواستی دستی شود:
   localStorage.setItem("reviewMode","manual")
========================= */
if (!localStorage.getItem("reviewMode")) {
  localStorage.setItem("reviewMode", "auto");
}

/* ---------- Load Dictionary ---------- */
fetch("pdcs_a1.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    // بعد از لود شدن صفحه، اگر مود auto است و لغت موعددار داریم → برو Leitner
    maybeAutoRedirectToLeitner();
  })
  .catch(err => console.error("JSON load error:", err));

/* ---------- Text To Speech ---------- */
function speak(text) {
  if (muted || !text) return;

  speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.7;
  utter.pitch = 1;

  // بعضی مرورگرها صداها را دیر لود می‌کنند؛ این خط کمک می‌کند
  const voices = speechSynthesis.getVoices();
  if (voices && voices.length) {
    const us = voices.find(v => v.lang === "en-US") || voices[0];
    if (us) utter.voice = us;
  }

  speechSynthesis.speak(utter);
}

// برای iOS/Safari: گاهی باید یکبار getVoices فراخوانی شود
window.speechSynthesis?.getVoices?.();

/* ---------- Search Word ---------- */
function searchWord() {
  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  const result = document.getElementById("result");
  result.innerHTML = "";

  if (!data || !data[input]) {
    result.innerHTML = "<p style='font-size:2rem'>❌ Not found</p>";
    return;
  }

  const w = data[input];

  // تلفظ خودکار کلمه
  speak(input);

  // امن‌سازی برای وقتی که فیلدی نبود
  const def = w.def || "";
  const exEn = (w.example && w.example.en) ? w.example.en : "";
  const exFa = (w.example && w.example.fa) ? w.example.fa : "";

  let html = `
    <div class="card">
      <div class="word">${input}</div>

      <div class="section">
        <div class="section-title">Definition</div>
        <div class="box" onclick="speak('${escapeJS(def)}')">
          <div class="en">${escapeHTML(def)}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Example</div>
        <div class="box" onclick="speak('${escapeJS(exEn)}')">
          <div class="en">${escapeHTML(exEn)}</div>
          <div class="fa-text">${escapeHTML(exFa)}</div>
        </div>
      </div>
  `;

  /* ---------- Collocations ---------- */
  if (Array.isArray(w.collocations) && w.collocations.length) {
    html += `<div class="section"><div class="section-title">Collocations</div>`;
    w.collocations.forEach(c => {
      const cen = c.en || "";
      const cfa = c.fa || "";
      html += `
        <div class="box" onclick="speak('${escapeJS(cen)}')">
          <div class="en">${escapeHTML(cen)}</div>
          <div class="fa-text">${escapeHTML(cfa)}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  /* ---------- Phrases ---------- */
  if (Array.isArray(w.phrases) && w.phrases.length) {
    html += `<div class="section"><div class="section-title">Phrases</div>`;
    w.phrases.forEach(p => {
      const pen = p.en || "";
      const pfa = p.fa || "";
      html += `
        <div class="box" onclick="speak('${escapeJS(pen)}')">
          <div class="en">${escapeHTML(pen)}</div>
          <div class="fa-text">${escapeHTML(pfa)}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  /* ---------- Phrasal Verbs ---------- */
  if (Array.isArray(w.phrasal_verbs) && w.phrasal_verbs.length) {
    html += `<div class="section"><div class="section-title">Phrasal Verbs</div>`;
    w.phrasal_verbs.forEach(pv => {
      const pven = pv.en || "";
      const pvfa = pv.fa || "";
      html += `
        <div class="box" onclick="speak('${escapeJS(pven)}')">
          <div class="en">${escapeHTML(pven)}</div>
          <div class="fa-text">${escapeHTML(pvfa)}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `</div>`;
  result.innerHTML = html;
}

/* ---------- Mute Button ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("muteBtn");
  if (!btn) return;

  btn.onclick = () => {
    muted = !muted;
    btn.innerText = muted ? "🔈 Sound On" : "🔇 Mute";
    if (muted) speechSynthesis.cancel();
  };
});

/* =======================
   LEITNER SYSTEM (REAL)
======================= */

const LEITNER_BOXES = 5;

function getLeitner() {
  return JSON.parse(localStorage.getItem("leitner")) || {};
}

function saveLeitner(obj) {
  localStorage.setItem("leitner", JSON.stringify(obj));
}

function addToLeitner() {
  const word = document.getElementById("searchInput")?.value?.trim()?.toLowerCase();
  if (!word || !data[word]) {
    alert("Search a valid word first");
    return;
  }

  const leitner = getLeitner();

  if (!leitner[word]) {
    leitner[word] = { box: 1, last: Date.now() };
    saveLeitner(leitner);
    alert("Added to Leitner (Box 1)");
  } else {
    alert("Already in Leitner");
  }
}

/* ---------- AUTO REVIEW (DEFAULT) ---------- */
function hasDueWords() {
  const leitner = getLeitner();
  const now = Date.now();

  // Box 1 روزانه، Box2 هر 2 روز، Box3 هر 4، Box4 هر 7، Box5 هر 14
  const days = [1, 2, 4, 7, 14];

  for (let w in leitner) {
    const box = Math.max(1, Math.min(LEITNER_BOXES, leitner[w].box || 1));
    const last = leitner[w].last || 0;
    const dueMs = days[box - 1] * 86400000;
    if (now - last >= dueMs) return true;
  }
  return false;
}

function isIndexPage() {
  const p = location.pathname.toLowerCase();
  return p.endsWith("/") || p.endsWith("/index.html");
}

function maybeAutoRedirectToLeitner() {
  const mode = localStorage.getItem("reviewMode") || "auto";
  if (mode !== "auto") return;
  if (!isIndexPage()) return;

  // اگر لغت موعددار داریم → برو به Leitner Review
  if (hasDueWords()) {
    location.href = "leitner.html";
  }
}

/* ---------- Helpers (برای جلوگیری از خراب شدن نقل‌قول‌ها) ---------- */
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[m]));
}

function escapeJS(s) {
  return String(s).replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\n/g," ");
}
