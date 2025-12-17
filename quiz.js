let data = {};
let words = [];
let current = "";
let mode = "en-fa";
let locked = false;

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
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.8;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function nextQuestion() {
  locked = false;
  current = words[Math.floor(Math.random() * words.length)];
  const q = document.getElementById("question");
  const opt = document.getElementById("options");
  opt.innerHTML = "";

  let correct, options = [];

  if (mode === "en-fa") {
    q.innerText = current;
    correct = data[current].fa;
    options.push(correct);
    while (options.length < 4) {
      const r = data[words[Math.floor(Math.random()*words.length)]].fa;
      if (!options.includes(r)) options.push(r);
    }
  }

  if (mode === "fa-en") {
    q.innerText = data[current].fa;
    correct = current;
    options.push(correct);
    while (options.length < 4) {
      const r = words[Math.floor(Math.random()*words.length)];
      if (!options.includes(r)) options.push(r);
    }
  }

  if (mode === "listen") {
    q.innerText = "🎧 Listen…";
    speak(current);
    correct = current;
    options.push(correct);
    while (options.length < 4) {
      const r = words[Math.floor(Math.random()*words.length)];
      if (!options.includes(r)) options.push(r);
    }
  }

  options.sort(() => Math.random() - 0.5);

  options.forEach(o => {
    const b = document.createElement("button");
    b.className = "option";
    b.innerText = o;
    b.onclick = () => checkAnswer(b, o === correct);
    opt.appendChild(b);
  });
}

function checkAnswer(btn, ok) {
  if (locked) return;
  locked = true;

  if (ok) {
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
    addToLeitner(current);
  }

  setTimeout(nextQuestion, 900);
}

function addToLeitner(word) {
  let l = JSON.parse(localStorage.getItem("leitner")) || {};
  l[word] = { box:1, last:Date.now() };
  localStorage.setItem("leitner", JSON.stringify(l));
}
