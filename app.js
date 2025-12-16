let data = {};
let muted = false;

/* ---------- Load Dictionary ---------- */
fetch("pdcs_a1.json")
  .then(res => res.json())
  .then(json => data = json)
  .catch(err => console.error("JSON load error:", err));

/* ---------- Text To Speech ---------- */
function speak(text) {
  if (muted || !text) return;

  speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.7;       // 🔥 سرعت 0.7
  utter.pitch = 1;

  // تلاش برای صدای زنانه
  const voices = speechSynthesis.getVoices();
  const female = voices.find(v =>
    v.lang === "en-US" && v.name.toLowerCase().includes("female")
  );
  if (female) utter.voice = female;

  speechSynthesis.speak(utter);
}

/* ---------- Search Word ---------- */
function searchWord() {
  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  const result = document.getElementById("result");
  result.innerHTML = "";

  if (!data[input]) {
    result.innerHTML = "<p>❌ Not found</p>";
    return;
  }

  const w = data[input];

  // تلفظ خودکار کلمه
  speak(input);

  let html = `
    <div class="card">
      <div class="word">${input}</div>

      <div class="section">
        <div class="section-title">Definition</div>
        <div class="box" onclick="speak('${w.def}')">
          <div class="en">${w.def}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Example</div>
        <div class="box" onclick="speak('${w.example.en}')">
          <div class="en">${w.example.en}</div>
          <div class="fa-text">${w.example.fa}</div>
        </div>
      </div>
  `;

  /* ---------- Collocations ---------- */
  if (w.collocations) {
    html += `<div class="section"><div class="section-title">Collocations</div>`;
    w.collocations.forEach(c => {
      html += `
        <div class="box" onclick="speak('${c.en}')">
          <div class="en">${c.en}</div>
          <div class="fa-text">${c.fa}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  /* ---------- Phrases ---------- */
  if (w.phrases) {
    html += `<div class="section"><div class="section-title">Phrases</div>`;
    w.phrases.forEach(p => {
      html += `
        <div class="box" onclick="speak('${p.en}')">
          <div class="en">${p.en}</div>
          <div class="fa-text">${p.fa}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  /* ---------- Phrasal Verbs ---------- */
  if (w.phrasal_verbs) {
    html += `<div class="section"><div class="section-title">Phrasal Verbs</div>`;
    w.phrasal_verbs.forEach(pv => {
      html += `
        <div class="box" onclick="speak('${pv.en}')">
          <div class="en">${pv.en}</div>
          <div class="fa-text">${pv.fa}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `</div>`;
  result.innerHTML = html;
}

/* ---------- Mute Button ---------- */
document.getElementById("muteBtn").onclick = () => {
  muted = !muted;
  document.getElementById("muteBtn").innerText = muted ? "🔈 Sound On" : "🔇 Mute";
};
/* =======================
   LEITNER SYSTEM (REAL)
======================= */

const LEITNER_BOXES = 5;

// init
function getLeitner() {
  return JSON.parse(localStorage.getItem("leitner")) || {};
}

function saveLeitner(data) {
  localStorage.setItem("leitner", JSON.stringify(data));
}

// add word
function addToLeitner() {
  const word = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!word || !data[word]) {
    alert("Search a valid word first");
    return;
  }

  const leitner = getLeitner();

  if (!leitner[word]) {
    leitner[word] = {
      box: 1,
      last: Date.now()
    };
    saveLeitner(leitner);
    alert("Added to Leitner (Box 1)");
  } else {
    alert("Already in Leitner");
  }
}

// get words for today
function getTodayWords() {
  const leitner = getLeitner();
  const today = [];

  for (let w in leitner) {
    const box = leitner[w].box;
    const days = [0, 1, 2, 4, 7]; // فاصله مرور
    const due =
      Date.now() - leitner[w].last >= days[box - 1] * 86400000;

    if (due) today.push(w);
  }

  return today;
}

// answer
function answerLeitner(word, correct) {
  const leitner = getLeitner();

  if (!leitner[word]) return;

  if (correct) {
    leitner[word].box = Math.min(LEITNER_BOXES, leitner[word].box + 1);
  } else {
    leitner[word].box = 1;
  }

  leitner[word].last = Date.now();
  saveLeitner(leitner);
}
