let data = {};
let muted = false;

fetch("pdcs_a1.json")
  .then(res => res.json())
  .then(json => data = json);

function speak(text) {
  if (muted) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  speechSynthesis.speak(u);
}

function searchWord() {
  const input = document.getElementById("searchInput");
  const word = input.value.trim().toLowerCase();
  const result = document.getElementById("result");

  if (!data[word]) {
    result.innerHTML = "<p class='notfound'>❌ Not found</p>";
    return;
  }

  const w = data[word];
  speak(word);

  let html = `
    <div class="card">
      <h2 class="word">${word}</h2>
      <p class="fa">${w.fa}</p>

      <div class="block">
        <strong>Definition</strong>
        <p class="en ltr">${w.def}</p>
      </div>

      <div class="block">
        <strong>Example</strong>
        <p class="en ltr">${w.example.en}</p>
        <p class="fa">${w.example.fa}</p>
      </div>
  `;

  if (w.collocations && w.collocations.length) {
    html += `<div class="block"><strong>Collocations</strong>`;
    w.collocations.forEach(c => {
      html += `<p class="en ltr">${c.en}</p><p class="fa">${c.fa}</p>`;
    });
    html += `</div>`;
  }

  if (w.phrases && w.phrases.length) {
    html += `<div class="block"><strong>Phrases</strong>`;
    w.phrases.forEach(p => {
      html += `<p class="en ltr">${p.en}</p><p class="fa">${p.fa}</p>`;
    });
    html += `</div>`;
  }

  html += `
      <button class="mute" onclick="muted=!muted">🔇 Mute</button>
    </div>
  `;

  result.innerHTML = html;
}
