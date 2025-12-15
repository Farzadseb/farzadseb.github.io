const DICT_URL = "pdcs_a1.json";

let DICT = {};

fetch(DICT_URL)
  .then(res => res.json())
  .then(data => {
    DICT = data;
    console.log("Dictionary loaded", Object.keys(DICT).length);
  });

function searchWord(){
  const input = document.getElementById("search");
  const result = document.getElementById("result");

  const w = input.value.trim().toLowerCase();

  if(!w){
    result.innerHTML = "❗ Enter a word";
    return;
  }

  if(!DICT[w]){
    result.innerHTML = "❌ Not found";
    return;
  }

  const d = DICT[w];

  result.innerHTML = `
    <div class="word">${w}</div>
    <div class="fa">🇮🇷 ${d.fa}</div>
    <div class="ex">📖 ${d.definition}</div>
    <div class="ex">📝 ${d.example}</div>
  `;
}
