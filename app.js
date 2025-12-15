const DICT_URL = "pdcs_a1.json";

let DICT = {};

fetch(DICT_URL)
  .then(r => r.json())
  .then(d => {
    DICT = d;
    console.log("Dictionary loaded", Object.keys(DICT).length);
  })
  .catch(e => alert("❌ Dictionary not loaded"));

function normalize(word){
  return word
    .toLowerCase()
    .trim();
}

function searchWord(){
  const input = document.getElementById("searchInput");
  const result = document.getElementById("result");

  let w = normalize(input.value);

  if(!w){
    result.innerHTML = "";
    return;
  }

  if(!DICT[w]){
    result.innerHTML = "❌ Not in dictionary";
    return;
  }

  const item = DICT[w];

  result.innerHTML = `
    <h2>${w}</h2>
    <p>🇮🇷 ${item.fa}</p>
    <p>📘 ${item.definition}</p>
    <p>✏️ ${item.example}</p>
  `;

  saveToLeitner(w);
}

function saveToLeitner(word){
  let L = JSON.parse(localStorage.getItem("leitner") || "{}");

  if(!L[word]){
    L[word] = {
      box: 1,
      last: Date.now()
    };
    localStorage.setItem("leitner", JSON.stringify(L));
  }
}
