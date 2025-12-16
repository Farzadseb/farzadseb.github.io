/*************************
 * A1 Dictionary - app.js
 *************************/

let data = {};
let muted = false;

/* ======================
   LOAD DICTIONARY
====================== */
fetch("pdcs_a1.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    console.log("Dictionary loaded:", Object.keys(data).length);
  })
  .catch(err => {
    console.error("JSON load error:", err);
    alert("Dictionary not loaded");
  });

/* ======================
   TEXT TO SPEECH
====================== */
function speak(text) {
  if (muted || !text) return;

  speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.7;
  utter.pitch = 1;

  const voices = speechSynthesis.getVoices();
  const female = voices.find(v =>
    v.lang === "en-US" &&
    (v.name.toLowerCase().includes("female") ||
     v.name.toLowerCase().includes("samantha") ||
     v.name.toLowerCase().includes("zira"))
  );
  if (female) utter.voice = female;

  speechSynthesis.speak(utter);
}

/* ======================
   SEARCH WORD
====================== */
function searchWord() {
  const inputEl = document.getElementById("searchInput");
  const result = document.getElementById("result");

  const word = inputEl.value.trim().toLowerCase();
  result.innerHTML = "";

  if (!word || !data[word]) {
    result.innerHTML = "<p style='font-size:1.4rem'>❌ Not found</p>";
    return;
  }

  const w = data[word];

  // Auto pronunciation
  speak(word);

  let html = `
    <div class="card">
      <div class="word">${word}</div>

      <div class="section">
        <div class="section-title">Definition</div>
        <div class="box" onclick="speak('${escapeText(w.def)}')">
          <div class="en">${w.def || ""}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Example</div>
        <div class="box" onclick="speak('${escapeText(w.example?.en)}')">
          <div class="en">${w.example?.en || ""}</div>
          <div class="fa-text">${w.example?.fa || ""}</div>
        </div>
      </div>
  `;

  /* ---------- Collocations ---------- */
  if (Array.isArray(w.collocations) && w.collocations.length) {
    html += `<div class="section"><div class="section-title">Collocations</div>`;
    w.collocations.forEach(c => {
      html += `
        <div class="box" onclick="speak('${escapeText(c.en)}')">
          <div class="en">${c.en}</div>
          <div class="fa-text">${c.fa || ""}</div>
        </div>`;
    });
    html += `</div>`;
  }

  /* ---------- Phrases ---------- */
  if (Array.isArray(w.phrases) && w.phrases.length) {
    html += `<div class="section"><div class="section-title">Phrases</div>`;
    w.phrases.forEach(p => {
      html += `
        <div class="box" onclick="speak('${escapeText(p.en)}')">
          <div class="en">${p.en}</div>
          <div class="fa-text">${p.fa || ""}</div>
        </div>`;
    });
    html += `</div>`;
  }

  /* ---------- Phrasal Verbs ---------- */
  if (Array.isArray(w.phrasal_verbs) && w.phrasal_verbs.length) {
    html += `<div class="section"><div class="section-title">Phrasal Verbs</div>`;
    w.phrasal_verbs.forEach(pv => {
      html += `
        <div class="box" onclick="speak('${escapeText(pv.en)}')">
          <div class="en">${pv.en}</div>
          <div class="fa-text">${pv.fa || ""}</div>
        </div>`;
    });
    html += `</div>`;
  }

  html += `
      <div style="text-align:center;margin-top:20px">
        <button onclick="addToLeitner('${word}')" style="font-size:1.6rem">
          ⭐ Add to Leitner
        </button>
      </div>
    </div>
  `;

  result.innerHTML = html;
}

/* ======================
   MUTE
====================== */
document.getElementById("muteBtn").onclick = () => {
  muted = !muted;
  document.getElementById("muteBtn").innerText =
    muted ? "🔈 Sound On" : "🔇 Mute";
};

/* ======================
   LEITNER SYSTEM (REAL)
====================== */
const BOX_INTERVALS = [0, 1, 2, 4, 7]; // days

function getLeitner() {
  return JSON.parse(localStorage.getItem("leitner")) || {};
}

function saveLeitner(obj) {
  localStorage.setItem("leitner", JSON.stringify(obj));
}

function addToLeitner(word) {
  const leitner = getLeitner();

  if (!leitner[word]) {
    leitner[word] = {
      box: 1,
      last: Date.now()
    };
    saveLeitner(leitner);
    alert("⭐ Added to Leitner (Box 1)");
  } else {
    alert("Already in Leitner");
  }
}

function getTodayLeitnerWords() {
  const leitner = getLeitner();
  const today = [];

  for (let w in leitner) {
    const box = leitner[w].box;
    const days = BOX_INTERVALS[box - 1] || 0;
    const due = Date.now() - leitner[w].last >= days * 86400000;
    if (due) today.push(w);
  }
  return today;
}

function answerLeitner(word, correct) {
  const leitner = getLeitner();
  if (!leitner[word]) return;

  leitner[word].box = correct
    ? Math.min(5, leitner[word].box + 1)
    : 1;

  leitner[word].last = Date.now();
  saveLeitner(leitner);
}

/* ======================
   HELPERS
====================== */
function escapeText(text = "") {
  return text.replace(/'/g, "\\'");
    }
