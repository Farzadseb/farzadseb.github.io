let data = {};
let words = [];
let current = "";
let correctAnswer = "";
let mode = "enfa";

/* ---------- LOAD DICTIONARY ---------- */
fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(j => {
    data = j;
    words = Object.keys(data);
    nextQuestion();
  });

/* ---------- MODE ---------- */
function setMode(m) {
  mode = m;
  document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  nextQuestion();
}

/* ---------- SPEAK ---------- */
function speak(text) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.7;
  speechSynthesis.speak(u);
}

/* ---------- QUESTION ---------- */
function nextQuestion() {
  if (!words.length) return;

  current = words[Math.floor(Math.random() * words.length)];
  const w = data[current];

  const q = document.getElementById("question");
  const a = document.getElementById("answers");
  a.innerHTML = "";

  let options = [];

  if (mode === "enfa") {
    q.innerText = current;
    correctAnswer = w.fa;
    options = makeOptions(w.fa, "fa");
  }

  if (mode === "faen") {
    q.innerText = w.fa;
    correctAnswer = current;
    options = makeOptions(current, "en");
  }

  if (mode === "listen") {
    q.innerText = "🔊 Listen carefully";
    speak(current);
    correctAnswer = w.fa;
    options = makeOptions(w.fa, "fa");
  }

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => checkAnswer(btn, opt);
    a.appendChild(btn);
  });
}

/* ---------- OPTIONS ---------- */
function makeOptions(correct, type) {
  let arr = [correct];
  while (arr.length < 4) {
    const r = words[Math.floor(Math.random() * words.length)];
    const val = type === "fa" ? data[r].fa : r;
    if (!arr.includes(val)) arr.push(val);
  }
  return arr.sort(() => Math.random() - 0.5);
}

/* ---------- CHECK ---------- */
function checkAnswer(btn, ans) {
  if (ans === correctAnswer) {
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
    addToLeitner(current);
  }
  setTimeout(nextQuestion, 800);
}

/* ---------- LEITNER ---------- */
function addToLeitner(word) {
  let l = JSON.parse(localStorage.getItem("leitner")) || {};
  l[word] = { box: 1, last: Date.now() };
  localStorage.setItem("leitner", JSON.stringify(l));
}
