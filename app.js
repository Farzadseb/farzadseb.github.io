let DICT = {};
let mute = false;

fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(d => DICT = d);

function searchWord(){
  let w = document.getElementById("searchInput").value.trim().toLowerCase();
  let result = document.getElementById("result");

  if(!DICT[w]){
    result.innerHTML = "❌ Not found in dictionary";
    return;
  }

  let item = DICT[w];

  result.innerHTML = `
    <h2>${w}</h2>
    🇮🇷 ${item.fa}<br><br>
    📘 ${item.def}<br><br>
    ✏️ ${item.example}<br><br>

    <b>📌 Collocations</b>
    <ul>
      ${item.collocations.map(c=>`<li>${c.en} — ${c.fa}</li>`).join("")}
    </ul>

    <button onclick="toggleMute()">🔇 Mute</button>
  `;

  if(!mute){
    let u = new SpeechSynthesisUtterance(w);
    speechSynthesis.speak(u);
  }
}

function toggleMute(){
  mute = !mute;
}
