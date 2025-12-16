const DICT_URL = "pdcs_a1.json";

let DICT = {};
let muted = false;

// LOAD DICTIONARY
fetch(DICT_URL)
  .then(res => res.json())
  .then(data => {
    DICT = data;
    console.log("Dictionary loaded", Object.keys(DICT).length);
  })
  .catch(err => {
    alert("❌ Dictionary file not loaded");
    console.error(err);
  });

function speak(word){
  if(muted) return;
  let u = new SpeechSynthesisUtterance(word);
  u.lang = "en-US";
  speechSynthesis.speak(u);
}

function toggleMute(){
  muted = !muted;
  document.getElementById("muteBtn").innerText =
    muted ? "🔇 Muted" : "🔊 Sound ON";
}

function searchWord(){
  let w = document.getElementById("searchInput").value
    .trim()
    .toLowerCase();

  let box = document.getElementById("result");
  box.innerHTML = "";

  if(!DICT[w]){
    box.innerHTML = "❌ Not found in dictionary";
    return;
  }

  let d = DICT[w];
  speak(w);

  let html = `
    <h2>${w}</h2>
    <p>🇮🇷 ${d.fa}</p>
    <p>📘 ${d.definition}</p>
    <p>✏️ ${d.example}</p>
  `;

  if(d.collocations){
    html += "<h4>📌 Collocations</h4><ul>";
    d.collocations.forEach(c=>{
      html += `<li>${c.en} — ${c.fa}</li>`;
    });
    html += "</ul>";
  }

  box.innerHTML = html;
}
