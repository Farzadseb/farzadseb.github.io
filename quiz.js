let data = {};
let keys = [];
let currentWord = "";
let mode = 1; // 1 EN->FA, 2 FA->EN, 3 Listening (Word audio -> FA)

let total = 0;
let correctCount = 0;

// ---------- DOM ----------
const qMain = document.getElementById("qMain");
const qSub = document.getElementById("qSub");
const choicesBox = document.getElementById("choices");
const fbOk = document.getElementById("fbOk");
const fbBad = document.getElementById("fbBad");
const errBox = document.getElementById("errBox");
const modeLabel = document.getElementById("modeLabel");
const counter = document.getElementById("counter");

const btnMode1 = document.getElementById("btnMode1");
const btnMode2 = document.getElementById("btnMode2");
const btnMode3 = document.getElementById("btnMode3");

const btnPlay = document.getElementById("btnPlay");
const btnNext = document.getElementById("btnNext");

// ---------- Helpers ----------
function showError(msg) {
  errBox.style.display = "block";
  errBox.textContent = msg;
}
function clearError() {
  errBox.style.display = "none";
  errBox.textContent = "";
}

function setActiveModeButton() {
  [btnMode1, btnMode2, btnMode3].forEach(b => b.classList.remove("active"));
  if (mode === 1) btnMode1.classList.add("active");
  if (mode === 2) btnMode2.classList.add("active");
  if (mode === 3) btnMode3.classList.add("active");
}

function updateCounter() {
  counter.textContent = `${correctCount} / ${total}`;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function pickRandomKey(exceptKey = "") {
  if (!keys.length) return "";
  let k = "";
  for (let i = 0; i < 30; i++) {
    k = keys[Math.floor(Math.random() * keys.length)];
    if (k !== exceptKey) return k;
  }
  return keys[0];
}

// ---------- TTS (Mobile-safe) ----------
function speak(text) {
  if (!text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.75;
    speechSynthesis.speak(u);
  } catch (e) {
    // silent
  }
}

// ---------- Leitner wrong -> box1 ----------
function addWrongToLeitner(word) {
  if (!word) return;
  const l = JSON.parse(localStorage.getItem("leitner") || "{}");
  l[word] = { box: 1, last: Date.now() };
  localStorage.setItem("leitner", JSON.stringify(l));
}

// ---------- Build 4 choices ----------
function buildChoices(correctAnswer, mapFn) {
  // mapFn(key) => answerString
  const options = new Set();
  options.add(correctAnswer);

  // پر کردن تا 4 گزینه
  while (options.size < 4) {
    const rk = pickRandomKey(currentWord);
    const val = mapFn(rk);
    if (val && val.trim()) options.add(val);
  }

  return shuffle([...options]);
}

// ---------- Render Question ----------
function hideFeedback() {
  fbOk.style.display = "none";
  fbBad.style.display = "none";
}
function showFeedback(isCorrect, correctText = "") {
  if (isCorrect) {
    fbOk.style.display = "block";
    fbBad.style.display = "none";
    fbOk.textContent = "✅ Correct";
  } else {
    fbBad.style.display = "block";
    fbOk.style.display = "none";
    fbBad.textContent = correctText ? `❌ Wrong — Correct: ${correctText}` : "❌ Wrong";
  }
}

function renderChoices(options, correctAnswer) {
  choicesBox.innerHTML = "";

  options.forEach(opt => {
    const b = document.createElement("button");
    b.className = "choice-btn";
    b.textContent = opt;

    b.onclick = () => {
      total++;
      const isCorrect = (opt === correctAnswer);

      if (isCorrect) {
        correctCount++;
        showFeedback(true);
      } else {
        addWrongToLeitner(currentWord);
        showFeedback(false, correctAnswer);
      }

      updateCounter();

      // بعد از پاسخ، سریع Next
      setTimeout(() => nextQuestion(), 450);
    };

    choicesBox.appendChild(b);
  });
}

// ---------- Question Generator ----------
function nextQuestion() {
  hideFeedback();
  clearError();

  if (!keys || keys.length < 4) {
    qMain.textContent = "Dictionary is too small.";
    qSub.style.display = "none";
    choicesBox.innerHTML = "";
    showError("Your pdcs_a1.json must contain at least 4 words. Right now it has: " + (keys ? keys.length : 0));
    return;
  }

  currentWord = pickRandomKey();
  const w = data[currentWord];

  // محافظت
  const fa = (w && w.fa) ? w.fa : "";
  const def = (w && w.def) ? w.def : "";

  if (mode === 1) {
    // EN -> FA (word shown + optional audio by Play)
    modeLabel.textContent = "Mode: EN → FA";
    qMain.textContent = currentWord;
    qSub.style.display = "none";

    const correct = fa;
    const options = buildChoices(correct, (k) => (data[k]?.fa || ""));
    renderChoices(options, correct);
  }

  if (mode === 2) {
    // FA -> EN (persian shown, choose word)
    modeLabel.textContent = "Mode: FA → EN";
    qMain.textContent = fa || "(No Persian meaning)";
    qSub.style.display = "none";

    const correct = currentWord;
    const options = buildChoices(correct, (k) => k);
    renderChoices(options, correct);
  }

  if (mode === 3) {
    // Listening (word audio only, choose FA meaning)
    modeLabel.textContent = "Mode: Listening → FA";
    qMain.textContent = "🎧 Listen and choose the meaning";
    qSub.style.display = "none";

    const correct = fa;
    const options = buildChoices(correct, (k) => (data[k]?.fa || ""));
    renderChoices(options, correct);

    // صدا را اتومات پخش نمی‌کنیم (موبایل گیر می‌دهد). با Play پخش می‌شود.
  }
}

// ---------- Mode Buttons ----------
btnMode1.onclick = () => { mode = 1; setActiveModeButton(); nextQuestion(); };
btnMode2.onclick = () => { mode = 2; setActiveModeButton(); nextQuestion(); };
btnMode3.onclick = () => { mode = 3; setActiveModeButton(); nextQuestion(); };

// ---------- Play / Next ----------
btnPlay.onclick = () => {
  if (!currentWord) return;
  if (mode === 2) {
    // در FA->EN، بهتر است کلمه‌ی درست را بخوانیم تا کمک کند
    speak(currentWord);
  } else {
    speak(currentWord); // در EN->FA و Listening
  }
};

btnNext.onclick = () => nextQuestion();

// ---------- Load Dictionary ----------
fetch("pdcs_a1.json")
  .then(r => {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  })
  .then(j => {
    data = j || {};
    keys = Object.keys(data);

    // ✅ اینجا دلیل “فقط book و make میاد” مشخص میشه:
    // اگر keys فقط 2 یا 4 باشد، مشکل از خود JSON است، نه Quiz.
    updateCounter();
    setActiveModeButton();
    nextQuestion();
  })
  .catch(err => {
    qMain.textContent = "Could not load pdcs_a1.json";
    choicesBox.innerHTML = "";
    showError(
      "Quiz is empty because pdcs_a1.json did not load.\n" +
      "Fix: put pdcs_a1.json next to quiz.html on GitHub Pages (same folder), and the name must match exactly.\n" +
      "Error: " + err.message
    );
  });
