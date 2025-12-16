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
