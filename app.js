let data = {};
let muted = false;

// load dictionary
fetch("pdcs_a1.json")
  .then(res => res.json())
  .then(json => data = json)
  .catch(err => console.error("JSON load error:", err));

// text to speech
function speak(text) {
  if (muted || !text) return;

  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.7;

  // try to pick female voice
  const voices = speechSynthesis.getVoices();
  const female = voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("female"));
  if (female) utter.voice = female;

  speechSynthesis.speak(utter);
}

// mute button
document.getElementById("muteBtn")?.addEventListener("click", () => {
  muted = !muted;
  document.getElementById("muteBtn").innerText = muted ? "🔈 Unmute" : "🔇 Mute";
});

function searchWord() {
  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  const result = document.getElementById("result");
  result.innerHTML = "";

  if (!data[input]) {
    result.innerHTML = "<p style='font-size:22px'>❌ Not found</p>";
    return;
  }

  const w = data[input];

  // speak word automatically
  speak(input);

  let html = `
    <div class="card">
      <div class="word">${input}</div>

      <div class="section">
        <div class="section-title">Definition</div>
        <div class="box">
          <div class="en">${w.def || ""}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Example</div>
        <div class="box">
          <div class="en">${w.example?.en || ""}</div>
          <div class="fa-text">${w.example?.fa || ""}</div>
        </div>
      </div>
  `;

  if (w.collocations?.length) {
    html += `<div class="section"><div class="section-title">Collocations</div>`;
    w.collocations.forEach(c => {
      html += `
        <div class="box">
          <div class="en">${c.en}</div>
          <div class="fa-text">${c.fa}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  if (w.phrases?.length) {
    html += `<div class="section"><div class="section-title">Phrases</div>`;
    w.phrases.forEach(p => {
      html += `
        <div class="box">
          <div class="en">${p.en}</div>
          <div class="fa-text">${p.fa}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  if (w.phrasal_verbs?.length) {
    html += `<div class="section"><div class="section-title">Phrasal Verbs</div>`;
    w.phrasal_verbs.forEach(pv => {
      html += `
        <div class="box">
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
