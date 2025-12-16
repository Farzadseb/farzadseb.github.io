let dict = {};
let muted = false;

// load json
fetch("pdcs_a1.json")
  .then(res => res.json())
  .then(data => dict = data);

// Enter key support
document.getElementById("searchInput")
  .addEventListener("keydown", e => {
    if (e.key === "Enter") searchWord();
  });

function searchWord() {
  const word = document
    .getElementById("searchInput")
    .value
    .trim()
    .toLowerCase();

  const result = document.getElementById("result");
  result.innerHTML = "";

  if (!dict[word]) {
    result.innerHTML = `<div class="card">❌ Not found</div>`;
    return;
  }

  const d = dict[word];

  if (!muted) {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  }

  result.innerHTML = `
    <div class="card">
      <h2 class="en">${word}</h2>

      <div class="fa">${d.fa}</div>

      <div class="section">
        <strong>Definition</strong>
        <div class="en">${d.def}</div>
      </div>

      <div class="section">
        <strong>Example</strong>
        <div class="en">${d.example.en}</div>
        <div class="fa">${d.example.fa}</div>
      </div>

      ${
        d.collocations
          ? `
          <div class="section">
            <strong>Collocations</strong>
            ${d.collocations.map(c =>
              `<div><span class="en">${c.en}</span> — <span class="fa">${c.fa}</span></div>`
            ).join("")}
          </div>`
          : ""
      }

      ${
        d.phrasal
          ? `
          <div class="section">
            <strong>Phrasal Verbs</strong>
            ${d.phrasal.map(p =>
              `<div><span class="en">${p.en}</span> — <span class="fa">${p.fa}</span></div>`
            ).join("")}
          </div>`
          : ""
      }

      <button class="mute" onclick="muted = !muted">
        🔇 Mute
      </button>
    </div>
  `;
}
