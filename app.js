const DICT_URL = "pdcs_a1.json";

let DICT = {};
let dictLoaded = false;

fetch(DICT_URL)
  .then(r => r.json())
  .then(d => {
    DICT = d;
    dictLoaded = true;
    console.log("Dictionary loaded", Object.keys(DICT).length);
  });

function searchWord() {
  const input = document.getElementById("search");
  const result = document.getElementById("result");

  if (!dictLoaded) {
    result.innerHTML = "⏳ Dictionary loading...";
    return;
  }

  let w = input.value
    .trim()
    .toLowerCase();

  if (!w) {
    result.innerHTML = "";
    return;
  }

  if (!DICT[w]) {
    result.innerHTML = "❌ Not found";
    return;
  }

  const item = DICT[w];

  result.innerHTML = `
    <h2>${w}</h2>
    <p><b>فارسی:</b> ${item.fa || "-"}</p>
    <p><b>English:</b> ${item.definition || "-"}</p>
    <p><b>Example:</b><br>${item.example || "-"}</p>
  `;
}
