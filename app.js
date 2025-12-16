let data = {};
let muted = false;

fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(j => data = j);

document.getElementById("searchInput")
  .addEventListener("keydown", e => {
    if (e.key === "Enter") searchWord();
  });

function speak(t){
  if(muted) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t);
  u.lang = "en-US";
  u.rate = 0.7;
  speechSynthesis.speak(u);
}

function searchWord(){
  const word = searchInput.value.trim().toLowerCase();
  const result = document.getElementById("result");
  result.innerHTML = "";

  if(!data[word]){
    result.innerHTML = "❌ Not found";
    return;
  }

  const d = data[word];
  speak(word);

  let html = `
  <div class="card">
    <h2 class="en">${word}</h2>
    <div class="fa">${d.fa || ""}</div>

    <div class="section">
      <strong>Definition</strong>
      <div class="en">${d.def}</div>
    </div>

    <div class="section">
      <strong>Example</strong>
      <div class="en">${d.example.en}</div>
      <div class="fa">${d.example.fa}</div>
    </div>
  `;

  if(d.collocations && d.collocations.length){
    html += `<div class="section"><strong>Collocations</strong>`;
    d.collocations.forEach(c=>{
      html += `
        <div class="en">${c.en}</div>
        <div class="fa">${c.fa}</div>
      `;
    });
    html += `</div>`;
  }

  if(d.phrases && d.phrases.length){
    html += `<div class="section"><strong>Phrases</strong>`;
    d.phrases.forEach(p=>{
      html += `
        <div class="en">${p.en}</div>
        <div class="fa">${p.fa}</div>
      `;
    });
    html += `</div>`;
  }

  html += `
    <button onclick="muted=!muted">🔇 Mute</button>
  </div>
  `;

  result.innerHTML = html;
}
