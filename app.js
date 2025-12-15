const DICT_URL = "pdcs_a1.json";

let DICT = {};
let dictLoaded = false;

fetch(DICT_URL)
  .then(res => res.json())
  .then(data => {
    DICT = data;
    dictLoaded = true;
    console.log("Dictionary loaded", Object.keys(DICT).length);
  })
  .catch(err => {
    alert("Dictionary load error");
    console.error(err);
  });

function searchWord() {
  if (!dictLoaded) {
    alert("Dictionary is loading, try again");
    return;
  }

  let input = document.getElementById("search").value.trim().toLowerCase();
  let result = document.getElementById("result");

  if (!input) {
    result.innerHTML = "";
    return;
  }

  if (!DICT[input]) {
    alert("Not in dictionary");
    return;
  }

  let w = DICT[input];

  result.innerHTML = `
    <h2>${input}</h2>
    <p>🇮🇷 ${w.fa}</p>
    <p>📘 ${w.definition}</p>
    <p>✏️ ${w.example}</p>
  `;
}
