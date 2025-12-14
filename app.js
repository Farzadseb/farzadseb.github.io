let dictionary = {};
let femaleVoice = null;

/* ---------- Load Dictionary ---------- */
fetch("pdcs_a1_sample.json")
  .then(res => res.json())
  .then(data => {
    dictionary = data;
  });

/* ---------- Load Voices (Safari safe) ---------- */
function loadVoices() {
  const voices = speechSynthesis.getVoices();
  femaleVoice = voices.find(v =>
    v.lang === "en-US" &&
    /female|woman|zira|samantha|karen|allison/i.test(v.name)
  );
}
speechSynthesis.onvoiceschanged = loadVoices;

/* ---------- Elements ---------- */
const input = document.getElementById("search");
const result = document.getElementById("result");
const savedList = document.getElementById("savedList");

/* ---------- LocalStorage ---------- */
function getSavedWords() {
  return JSON.parse(localStorage.getItem("savedWords") || "[]");
}

function saveWord(word) {
  const words = getSavedWords();
  if (!words.includes(word)) {
    words.push(word);
    localStorage.setItem("savedWords", JSON.stringify(words));
    renderSavedWords();
  }
}

function renderSavedWords() {
  const words = getSavedWords();
  savedList.innerHTML = words.map(w =>
    `<div class="saved-word" onclick="speak('${w}')">${w}</div>`
  ).join("");
}

/* ---------- Search ---------- */
input.addEventListener("input", () => {
  const word = input.value.trim().toLowerCase();

  if (!word || !dictionary[word]) {
    result.innerHTML = "";
    return;
  }

  const item = dictionary[word];

  /* --- Smart field detection --- */
  const definition =
    item.en ||
    item.definition ||
    "";

  let exampleEn = "";
  let exampleFa = "";

  if (Array.isArray(item.examples) && item.examples.length > 0) {
    exampleEn = item.examples[0].en || "";
    exampleFa = item.examples[0].fa || "";
  } else if (typeof item.example === "string") {
    exampleEn = item.example;
  }

  result.innerHTML = `
    <div class="card">
      <div class="word" onclick="handleWordClick('${word}')">${word}</div>
      <div class="fa">${item.fa || ""}</div>
      <div class="en">${definition}</div>
      <div class="example">
        ${exampleEn}<br/>${exampleFa}
      </div>
    </div>
  `;
});

/* ---------- Speak + Save ---------- */
function handleWordClick(word) {
  saveWord(word);
  speak(word);
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.7;
  utter.pitch = 1;

  if (femaleVoice) utter.voice = femaleVoice;

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

/* ---------- Init ---------- */
renderSavedWords();
