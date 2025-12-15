const DICT_URL = "pdcs_a1.json";
let DICT = {};
let autoSpeak = true;

// load dictionary
fetch(DICT_URL)
  .then(r => r.json())
  .then(d => DICT = d);

function speak(word) {
  if (!autoSpeak) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = "en-US";
  speechSynthesis.speak(u);
}

function searchWord() {
  const w = document.getElementById("searchInput").value
    .toLowerCase()
    .trim();

  const result = document.getElementById("result");
  result.innerHTML = "";

  if (!DICT[w]) {
    alert("Not in dictionary");
    return;
  }

  const d = DICT[w];
  speak(w);

  let html = `
    <h2>${w}</h2>
    <p>🇮🇷 ${d.fa}</p>
    <p>📘 ${d.definition}</p>
    <p>✏️ ${d.example}</p>
  `;

  if (d.collocations && d.collocations.length) {
    html += "<h3>📌 Collocations</h3><ul>";
    d.collocations.forEach(c => {
      html += `<li>${c.en} — ${c.fa}</li>`;
    });
    html += "</ul>";
  }

  if (d.phrasal_verbs && d.phrasal_verbs.length) {
    html += "<h3>🔗 Phrasal Verbs</h3><ul>";
    d.phrasal_verbs.forEach(p => {
      html += `<li>${p.en} — ${p.fa}</li>`;
    });
    html += "</ul>";
  }

  html += `
    <button onclick="autoSpeak=!autoSpeak">
      🔈 ${autoSpeak ? "Mute" : "Unmute"}
    </button>
  `;

  result.innerHTML = html;
}
