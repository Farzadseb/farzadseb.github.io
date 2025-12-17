let data = {};
let muted = false;

/* ===== Load Dictionary ===== */
fetch("pdcs_a1.json")
  .then(res => res.json())
  .then(json => data = json);

/* ===== Speech ===== */
function speak(text){
  if(muted || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.7;
  speechSynthesis.speak(u);
}

/* ===== Search ===== */
function searchWord(){
  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  const result = document.getElementById("result");
  result.innerHTML = "";

  if(!data[input]){
    result.innerHTML = "<p>❌ Not found</p>";
    return;
  }

  const w = data[input];
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

  if(w.collocations){
    html += `<div class="section"><div class="section-title">Collocations</div>`;
    w.collocations.forEach(c=>{
      html+=`
      <div class="box" onclick="speak('${c.en}')">
        <div class="en">${c.en}</div>
        <div class="fa-text">${c.fa}</div>
      </div>`;
    });
    html += `</div>`;
  }

  if(w.phrases){
    html += `<div class="section"><div class="section-title">Phrases</div>`;
    w.phrases.forEach(p=>{
      html+=`
      <div class="box" onclick="speak('${p.en}')">
        <div class="en">${p.en}</div>
        <div class="fa-text">${p.fa}</div>
      </div>`;
    });
    html += `</div>`;
  }

  if(w.phrasal_verbs){
    html += `<div class="section"><div class="section-title">Phrasal Verbs</div>`;
    w.phrasal_verbs.forEach(pv=>{
      html+=`
      <div class="box" onclick="speak('${pv.en}')">
        <div class="en">${pv.en}</div>
        <div class="fa-text">${pv.fa}</div>
      </div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;
  result.innerHTML = html;
}

/* ===== Mute ===== */
document.getElementById("muteBtn").onclick = ()=>{
  muted=!muted;
  document.getElementById("muteBtn").innerText = muted?"🔈 Sound On":"🔇 Mute";
};

/* ===== LEITNER (REAL) ===== */
function getLeitner(){
  return JSON.parse(localStorage.getItem("leitner")) || {};
}
function saveLeitner(d){
  localStorage.setItem("leitner",JSON.stringify(d));
}

function addToLeitner(){
  const w = document.getElementById("searchInput").value.trim().toLowerCase();
  if(!data[w]) return alert("Search word first");
  const l = getLeitner();
  if(!l[w]){
    l[w]={box:1,last:Date.now()};
    saveLeitner(l);
    alert("Added to Leitner");
  }
}
