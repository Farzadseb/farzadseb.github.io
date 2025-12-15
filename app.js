const DICT_URL = "pdcs_a1.json";
let DICT = {};

fetch(DICT_URL)
  .then(r => r.json())
  .then(d => {
    DICT = d;
    console.log("Dictionary loaded", Object.keys(DICT).length);
  });

function searchWord(){
  const input = document.getElementById("search").value
    .trim()
    .toLowerCase();

  const result = document.getElementById("result");

  if(!input){
    result.innerHTML = "";
    return;
  }

  if(!DICT[input]){
    result.innerHTML = "❌ Not found";
    return;
  }

  const w = DICT[input];

  result.innerHTML = `
    <div class="word">${input}</div>
    <div>🇮🇷 <b>Fa:</b> ${w.fa}</div>
    <div>📖 <b>Definition:</b> ${w.definition}</div>
    <div>✏️ <b>Example:</b> ${w.example}</div>
  `;
}
