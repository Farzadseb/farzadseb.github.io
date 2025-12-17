let data = {};
let words = [];
let mode = "enfa";
let current = "";

fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(j => {
    data = j;
    words = Object.keys(data);
    nextQuestion();
  });

function setMode(m) {
  mode = m;
  document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  nextQuestion();
}

function speak(text) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.7;
  speechSynthesis.speak(u);
}

function nextQuestion() {
  const q = words[Math.floor(Math.random() * words.length)];
  current = q;

  const box = document.getElementById("question");
  const opts = document.getElementById("options");
  opts.innerHTML = "";
  box.innerHTML = "";

  let correct, options = [];

  if (mode === "enfa") {
    box.innerText = q;
    correct = data[q].fa;
    options = getOptions("fa", correct);
  }

  if (mode === "faen") {
    box.innerText = data[q].fa;
    correct = q;
    options = getOptions("en", correct);
  }

  if (mode === "listen") {
    box.innerHTML = "🔊 Listen...";
    speak(q);
    correct = q;
    options = getOptions("en", correct);
  }

  options.forEach(o => {
    const b = document.createElement("button");
    b.className = "option";
    b.innerText = o;
    b.onclick = () => check(b, o, correct);
    opts.appendChild(b);
  });
}

function getOptions(type, correct) {
  let arr = [correct];
  while (arr.length < 4) {
    const r = words[Math.floor(Math.random() * words.length)];
    const val = type === "fa" ? data[r].fa : r;
    if (!arr.includes(val)) arr.push(val);
  }
  return arr.sort(() => Math.random() - 0.5);
}

function check(btn, ans, correct) {
  document.querySelectorAll(".option").forEach(b => b.disabled = true);

  if (ans === correct) {
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
    addWrong(correct);
  }

  setTimeout(nextQuestion, 900);
}

function addWrong(word) {
  let l = JSON.parse(localStorage.getItem("leitner")) || {};
  l[word] = { box: 1, last: Date.now() };
  localStorage.setItem("leitner", JSON.stringify(l));
}
