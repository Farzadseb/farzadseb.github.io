let data = {};
let words = [];
let current = "";
let correctAnswer = "";
let mode = "en-fa";

fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(j => {
    data = j;
    words = Object.keys(data);
    nextQuestion();
  });

function setMode(m) {
  mode = m;
  nextQuestion();
}

function nextQuestion() {
  document.getElementById("feedback").innerHTML = "";

  current = words[Math.floor(Math.random() * words.length)];
  const w = data[current];

  let questionText = "";
  correctAnswer = "";

  if (mode === "en-fa") {
    questionText = current;
    correctAnswer = w.fa;
  }

  if (mode === "fa-en") {
    questionText = w.fa;
    correctAnswer = current;
  }

  if (mode === "listen") {
    questionText = "🎧 Listen...";
    speak(w.example?.en || current);
    correctAnswer = current;
  }

  document.getElementById("question").innerText = questionText;

  let options = [correctAnswer];

  while (options.length < 4) {
    const r = words[Math.floor(Math.random() * words.length)];
    const opt =
      mode === "fa-en" ? r : data[r].fa;

    if (!options.includes(opt)) options.push(opt);
  }

  options.sort(() => Math.random() - 0.5);

  const box = document.getElementById("choices");
  box.innerHTML = "";

  options.forEach(o => {
    const b = document.createElement("button");
    b.innerText = o;
    b.onclick = () => check(o);
    box.appendChild(b);
  });
}

function check(ans) {
  const fb = document.getElementById("feedback");

  if (ans === correctAnswer) {
    fb.innerHTML = `<div style="color:#1b7f3b;font-size:1.6rem;">✅ Correct</div>`;
  } else {
    fb.innerHTML = `<div style="color:#b00020;font-size:1.6rem;">❌ Wrong</div>`;
    addWrongToLeitner(current);
  }

  setTimeout(nextQuestion, 900);
}

function addWrongToLeitner(word) {
  let l = JSON.parse(localStorage.getItem("leitner")) || {};
  l[word] = { box: 1, last: Date.now() };
  localStorage.setItem("leitner", JSON.stringify(l));
}
