let DATA = {};

fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(d => DATA = d);

function searchWord(){
  let w = document.getElementById("wordInput").value.toLowerCase();
  let d = DATA[w];
  if(!d){
    alert("Not in dictionary");
    return;
  }
  showResult(w,d);
}

function showResult(word,d){
  const r = document.getElementById("result");
  r.style.display="block";

  let html = `
    <h2>${word}</h2>
    <p><b>Meaning:</b> ${d.fa}</p>

    <div class="section">Example</div>
    <p>${d.example.en}</p>
    <p style="color:#666">${d.example.fa}</p>
  `;

  if(d.collocations && d.collocations.length){
    html += `
      <div class="section">Collocations</div>
      <ul>
        ${d.collocations.map(c=>`<li>${c.en} — ${c.fa}</li>`).join("")}
      </ul>
    `;
  }

  if(d.phrasal && d.phrasal.length){
    html += `
      <div class="section">Phrasal Verbs</div>
      <ul>
        ${d.phrasal.map(p=>`<li>${p.en} — ${p.fa}</li>`).join("")}
      </ul>
    `;
  }

  r.innerHTML = html;
}

function speakWord(){
  let w = document.getElementById("wordInput").value;
  let u = new SpeechSynthesisUtterance(w);
  u.lang="en-US";
  u.rate=0.7;
  speechSynthesis.speak(u);
}

function saveWord(){
  let w = document.getElementById("wordInput").value;
  let L = JSON.parse(localStorage.getItem("leitner") || "{}");
  if(!L[w]){
    L[w] = { box:1, last:Date.now() };
  }
  localStorage.setItem("leitner", JSON.stringify(L));
}

function toggleDark(){
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",document.body.classList.contains("dark")?"dark":"light");
}

(function(){
  if(localStorage.getItem("theme")==="dark"){
    document.body.classList.add("dark");
  }
})();
