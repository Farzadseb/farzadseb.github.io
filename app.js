let DICT = {};
let muted = false;

// ---- Leitner settings ----
const LS_DECK = "leitner_deck_v1";       // word -> { box, due, seen, correct, wrong, last }
const LS_SEEN = "seen_words_v1";         // array of words (unique)
const LS_LAST_LOOKUP = "last_lookup_v1"; // last searched word

// Load dictionary
fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(d => {
    DICT = d;
    console.log("DICT loaded:", Object.keys(DICT).length);
  })
  .catch(err => {
    alert("❌ Dictionary load failed (pdcs_a1.json)");
    console.error(err);
  });

// ---------- helpers ----------
function nowMs() { return Date.now(); }

function loadDeck() {
  try { return JSON.parse(localStorage.getItem(LS_DECK) || "{}"); }
  catch { return {}; }
}
function saveDeck(deck) {
  localStorage.setItem(LS_DECK, JSON.stringify(deck));
}

function loadSeen() {
  try { return JSON.parse(localStorage.getItem(LS_SEEN) || "[]"); }
  catch { return []; }
}
function saveSeen(arr) {
  localStorage.setItem(LS_SEEN, JSON.stringify(arr));
}

function addSeenWord(word) {
  const seen = loadSeen();
  if (!seen.includes(word)) {
    seen.push(word);
    saveSeen(seen);
  }
}

function ensureCard(word) {
  const deck = loadDeck();
  if (!deck[word]) {
    deck[word] = {
      box: 1,               // 1..5
      due: nowMs(),         // due now
      seen: 0,
      correct: 0,
      wrong: 0,
      last: null
    };
    saveDeck(deck);
  }
  return deck;
}

function setCard(word, updaterFn) {
  const deck = loadDeck();
  if (!deck[word]) {
    deck[word] = { box: 1, due: nowMs(), seen: 0, correct: 0, wrong: 0, last: null };
  }
  updaterFn(deck[word]);
  saveDeck(deck);
}

function nextIntervalMs(box) {
  // ساده و قابل اعتماد (قابل تغییر بعداً)
  // Box1: 10 دقیقه، Box2: 1 ساعت، Box3: 1 روز، Box4: 3 روز، Box5: 7 روز
  const minutes = 60 * 1000;
  const hours = 60 * minutes;
  const days = 24 * hours;

  if (box === 1) return 10 * minutes;
  if (box === 2) return 1 * hours;
  if (box === 3) return 1 * days;
  if (box === 4) return 3 * days;
  return 7 * days; // box 5
}

// ---------- speech ----------
function speak(text) {
  if (muted) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.7;
  speechSynthesis.speak(u);
}

// ---------- dictionary search ----------
function searchWord() {
  const input = document.getElementById("searchInput");
  const result = document.getElementById("result");

  const w = (input.value || "").trim().toLowerCase();
  if (!w) { result.innerHTML = ""; return; }

  localStorage.setItem(LS_LAST_LOOKUP, w);

  if (!DICT[w]) {
    result.innerHTML = "❌ Not found in dictionary";
    return;
  }

  const d = DICT[w];

  // save progress + leitner card
  addSeenWord(w);
  ensureCard(w);
  setCard(w, (c) => {
    c.seen += 1;
    c.last = nowMs();
    // اگر تازه اضافه شده یا عقب افتاده، due را همین الان کن
    if (!c.due || c.due > nowMs()) c.due = Math.min(c.due || nowMs(), nowMs());
  });

  // render
  let html = `
    <h2>${w}</h2>
    <div>🇮🇷 ${d.fa || ""}</div>
    <div>📘 ${d.def || d.definition || ""}</div>
    <div>✏️ ${d.example || ""}</div>
  `;

  if (d.collocations && Array.isArray(d.collocations) && d.collocations.length) {
    html += `<div class="collocations"><strong>📌 Collocations</strong><ul>`;
    d.collocations.forEach(c => {
      if (typeof c === "string") html += `<li>${c}</li>`;
      else html += `<li>${c.en || ""} — ${c.fa || ""}</li>`;
    });
    html += `</ul></div>`;
  }

  html += `
    <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
      <button onclick="toggleMute()" style="flex:1; min-width:160px;">
        ${muted ? "🔊 Unmute" : "🔇 Mute"}
      </button>
      <button onclick="location.href='progress.html'" style="flex:1; min-width:160px;">
        📊 Progress / Leitner
      </button>
    </div>
  `;

  result.innerHTML = html;
  speak(w);
}

function toggleMute() {
  muted = !muted;
  // اختیاری: یک بازخورد کوچک
  try { navigator.vibrate && navigator.vibrate(30); } catch {}
}
