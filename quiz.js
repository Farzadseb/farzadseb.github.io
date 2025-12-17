let data = {};
let keys = [];
let currentWord = "";
let mode = "listenA"; // فقط Listen A فعلاً

fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(j => {
    data = j.words || j; // اگر meta داشت
    keys = Object.keys(data);
    nextQuestion();
  });

function speak(text) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.75;
  speechSynthesis.speak(u);
}

function nextQuestion() {
  if (keys.length < 4) return;

  currentWord = keys[Math.floor(Math.random() * keys.length)];

  const q = document.getElementById("question");
  const c = document.getElementById("choices");

  q.innerHTML = "🔊 Listen";
  c.innerHTML = "";

  // 🔊 فقط لغت پخش می‌شود
  speak(currentWord);

  let answers = [];
  answers.push(data[currentWord].def);

  while (answers.length < 4) {
    const r = keys[Math.floor(Math.random() * keys.length)];
    const def = data[r].def;
    if (!answers.includes(def)) answers.push(def);
  }

  answers.sort(() => Math.random() - 0.5);

  answers.forEach(a => {
    const b = document.createElement("button");
    b.innerText = a;
    b.onclick = () => check(a);
    c.appendChild(b);
  });
}

function check(ans) {
  const correct = data[currentWord].def;

  if (ans === correct) {
    flash(true);
  } else {
    flash(false);
    addToLeitner(currentWord);
  }

  setTimeout(nextQuestion, 800);
}

function flash(ok) {
  document.body.style.background = ok ? "#e8fff0" : "#ffecec";
  setTimeout(() => {
    document.body.style.background = "";
  }, 400);
}

function addToLeitner(word) {
  let l = JSON.parse(localStorage.getItem("leitner")) || {};
  l[word] = { box: 1, last: Date.now() };
  localStorage.setItem("leitner", JSON.stringify(l));
}
