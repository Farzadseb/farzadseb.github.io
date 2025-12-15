let DATA = {};
fetch("pdcs_a1.json").then(r=>r.json()).then(d=>DATA=d);

function searchWord(){
  if(!checkAccess()) return;
  if(!canUseToday(20)) return;

  let w = document.getElementById("wordInput").value.toLowerCase();
  let d = DATA[w];
  if(!d){
    alert("Not in dictionary");
    return;
  }
  showResult(w,d);
}

function showResult(word,d){
  let r = document.getElementById("result");
  r.style.display="block";
  r.innerHTML=`
    <h2>${word}</h2>
    <p><b>Meaning:</b> ${d.fa}</p>
    <p><b>Example:</b> ${d.example}</p>
    ${d.collocations?`<b>Collocations</b><ul>${d.collocations.map(c=>`<li>${c.en} — ${c.fa}</li>`).join("")}</ul>`:""}
    ${d.phrasal?`<b>Phrasal Verbs</b><ul>${d.phrasal.map(p=>`<li>${p.en} — ${p.fa}</li>`).join("")}</ul>`:""}
  `;
}

function speakWord(){
  let w=document.getElementById("wordInput").value;
  let u=new SpeechSynthesisUtterance(w);
  u.lang="en-US";
  u.rate=0.7;
  speechSynthesis.speak(u);
}

function saveWord(){
  let w=document.getElementById("wordInput").value;
  let S=JSON.parse(localStorage.getItem("saved")||"[]");
  if(!S.includes(w)){S.push(w);}
  localStorage.setItem("saved",JSON.stringify(S));
}

function toggleDark(){
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",document.body.classList.contains("dark")?"dark":"light");
}

(function(){
  if(localStorage.getItem("theme")==="dark") document.body.classList.add("dark");
})();

/* ---- Access + Limit ---- */

function checkAccess(){ return true; }

function canUseToday(limit){
  let D=JSON.parse(localStorage.getItem("daily")||"{}");
  let t=new Date().toDateString();
  if(!D[t]) D[t]=0;
  if(D[t]>=limit) return false;
  D[t]++;
  localStorage.setItem("daily",JSON.stringify(D));
  return true;
}
