/* ================================
   FredDic – FINAL APP.JS
   PDF Text + Dictionary (A Mode)
   ================================ */

let WORD_MAP = {};

/* ---------- Load Dictionary ---------- */
fetch("pdcs_a1_sample.json")
  .then(res => res.json())
  .then(data => {
    WORD_MAP = data.dictionary || {};
    console.log("✅ Dictionary loaded:", Object.keys(WORD_MAP).length);
  })
  .catch(err => {
    console.error("❌ Dictionary load error", err);
  });

/* ---------- Normalize Word ---------- */
function normalizeWord(word) {
  return word
    .toLowerCase()
    .replace(/[^a-z']/g, "")
    .trim();
}

/* ---------- Speak Word ---------- */
function speak(word) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.7;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

/* ---------- Show Dictionary Card ---------- */
function showCard(rawWord) {
  const cleanWord = normalizeWord(rawWord);
  const entry = WORD_MAP[cleanWord];

  const card = document.getElementById("dict-card");
  const title = document.getElementById("dict-word");
  const meaning = document.getElementById("dict-fa");
  const def = document.getElementById("dict-def");
  const exEn = document.getElementById("dict-ex-en");
  const exFa = document.getElementById("dict-ex-fa");

  if (!entry) {
    title.textContent = cleanWord || rawWord;
    meaning.textContent = "این لغت هنوز در دیکشنری شما نیست";
    def.textContent = "";
    exEn.textContent = "";
    exFa.textContent = "";
    card.classList.add("show");
    speak(cleanWord);
    return;
  }

  title.textContent = entry.word || cleanWord;
  meaning.textContent = entry.fa || "";
  def.textContent = entry.definition || "";

  if (entry.example) {
    exEn.textContent = entry.example.en || "";
    exFa.textContent = entry.example.fa || "";
  } else {
    exEn.textContent = "";
    exFa.textContent = "";
  }

  card.classList.add("show");
  speak(cleanWord);
}

/* ---------- Attach Click to PDF Text ---------- */
function makeTextClickable(container) {
  const textNodes = [];

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) {
      textNodes.push(node);
    } else {
      node.childNodes.forEach(walk);
    }
  }

  walk(container);

  textNodes.forEach(node => {
    const words = node.nodeValue.split(/(\s+)/);
    const fragment = document.createDocumentFragment();

    words.forEach(word => {
      if (word.trim()) {
        const span = document.createElement("span");
        span.textContent = word;
        span.className = "click-word";
        span.addEventListener("click", () => showCard(word));
        fragment.appendChild(span);
      } else {
        fragment.appendChild(document.createTextNode(word));
      }
    });

    node.parentNode.replaceChild(fragment, node);
  });
}

/* ---------- PDF Load Hook (call after render) ---------- */
/*
   بعد از اینکه pdf.js صفحه را رندر کرد،
   این تابع را روی container صدا بزن
*/
function onPdfRendered(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  makeTextClickable(container);
}

/* ---------- Close Card ---------- */
function closeCard() {
  document.getElementById("dict-card").classList.remove("show");
}
