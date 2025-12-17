let data = {};
let words = [];
let mode = "enfa";
let current = "";

fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(j => {
    data = j;
    words = Object.keys(data);   // ✅ کل دیکشنری
    nextQuestion();
  });

function setMode(m) {
  mode = m;
  document.querySelectorAll(".mode-bar button")
    .forEach(b => b.classList.remove("active"));
  document.getElementById(m).classList.add("active");
  nextQuestion();
}

function speak(text) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.8;
  speechSynthesis.speak(u);
}

function nextQuestion() {
  current = words[Math.floor(Math.random() * words.length)];
  const w = data[current];

  let questionText = "";
  let correct = "";

  if (mode === "enfa") {
    questionText = current;
    correct = w.fa;
    speak(current);
  }

  if (mode === "faen") {
    questionText = w.fa;
    correct = current;
  }

  if (mode === "listen") {
    questionText = "🎧 Listen";
    correct = current;
    speak(current);
  }

  document.getElementById("question").innerText = questionText;

  let options = [correct];
  while (options.length < 4) {
    const r = words[Math.floor(Math.random() * words.length)];
    const opt =
      mode === "faen" ? r : data[r].fa;
    if (!options.includes(opt)) options.push(opt);
  }

  options.sort(() => Math.random() - 0.5);

  const box = document.getElementById("options");
  box.innerHTML = "";

  options.forEach(o => {
    const b = document.createElement("button");
    b.innerText = o;
    b.onclick = () => check(o, correct);
    box.appendChild(b);
  });
}

function check(ans, correct) {
  if (ans === correct) {
    event.target.style.background = "#c8f7c5"; // سبز
  } else {
    event.target.style.background = "#f7c5c5"; // قرمز
    addWrong(current);
  }
  setTimeout(nextQuestion, 700);
}

function addWrong(word) {
  let l = JSON.parse(localStorage.getItem("leitner")) || {};
  l[word] = { box: 1, last: Date.now() };
  localStorage.setItem("leitner", JSON.stringify(l));
}
