let data = {};
let keys = [];
let currentWord = "";
let correctAnswer = "";

fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(j => {
    data = j;
    keys = Object.keys(data);
    nextQuestion();
  });

function nextQuestion() {
  const q = keys[Math.floor(Math.random() * keys.length)];
  currentWord = q;
  const w = data[q];

  // حالت سوال: لغت یا مثال
  const useExample = Math.random() > 0.5 && w.example;
  document.getElementById("question").innerText =
    useExample ? w.example.en : q;

  correctAnswer = w.fa;

  let options = [correctAnswer];

  while (options.length < 4) {
    const r = keys[Math.floor(Math.random() * keys.length)];
    const f = data[r].fa;
    if (!options.includes(f)) options.push(f);
  }

  options.sort(() => Math.random() - 0.5);

  const box = document.getElementById("options");
  box.innerHTML = "";

  options.forEach(o => {
    const btn = document.createElement("button");
    btn.innerText = o;
    btn.onclick = () => checkAnswer(btn, o);
    box.appendChild(btn);
  });
}

function checkAnswer(button, answer) {
  const buttons = document.querySelectorAll(".options button");
  buttons.forEach(b => b.disabled = true);

  if (answer === correctAnswer) {
    button.classList.add("correct");
  } else {
    button.classList.add("wrong");
    addWrongToLeitner(currentWord);

    buttons.forEach(b => {
      if (b.innerText === correctAnswer) {
        b.classList.add("correct");
      }
    });
  }

  setTimeout(nextQuestion, 1000);
}

function addWrongToLeitner(word) {
  let l = JSON.parse(localStorage.getItem("leitner")) || {};
  l[word] = { box: 1, last: Date.now() };
  localStorage.setItem("leitner", JSON.stringify(l));
}
