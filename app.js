const DICT_URL = "pdcs_a1.json";
let DICT = {};

fetch(DICT_URL)
  .then(res => res.json())
  .then(data => {
    DICT = data;
    console.log("Dictionary loaded", DICT);
  });

function searchWord(){
  const w = document.getElementById("search").value.trim().toLowerCase();
  const result = document.getElementById("result");

  if(!DICT[w]){
    result.innerHTML = "❌ Not found";
    return;
  }

  const d = DICT[w];

  result.innerHTML = `
    <div class="word">${w}</div>
    <div class="fa"><b>فارسی:</b> ${d.fa}</div>
    <div><b>Definition:</b> ${d.definition || "-"}</div>
    <div><b>Example:</b> ${d.example || "-"}</div>
  `;
}
