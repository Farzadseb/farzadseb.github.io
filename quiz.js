let data = {};
let keys = [];
let current = "";
let mode = 1;

// LOAD DATA
fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(j => {
    data = j.words || j;
    keys = Object.keys(data);
    nextQuestion();
  });

// SPEECH
function speak(text) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.75;
  speechSynthesis.speak(u);
}

// NEXT QUESTION
function nextQuestion() {
  if (keys.length < 4) return;

  mode = Math.floor(Math.random() * 3) + 1;
  current = keys[Math.floor(Math.random() * keys.length)];

  const q = document.getElementById("question");
  const c = document.getElementById("choices");
  const m = document.getElementById("modeBox");

  q.innerHTML = "";
  c.innerHTML = "";

  let answers = [];
  let correct = "";

  // MODE 1 — Listen WORD → Persian
  if (mode === 1) {
    m.innerText = "🎧 English → Persian";
    q.innerHTML = `
      <div class="big-word">${current}</div>
      <button class="sound-btn" onclick="speak('${current}')">🔊 Repeat</button>
    `;
    speak(current);

    correct = data[current].fa;
    answers.push(correct);

    while (answers.length < 4) {
      const r = data[keys[Math.floor(Math.random() * keys.length)]].fa;
      if (!answers.includes(r)) answers.push(r);
    }
  }

  // MODE 2 — Listen WORD → English Definition
  if (mode === 2) {
    m.innerText = "🎧 English → Definition";
    q.innerHTML = `
      <div class="big-word">🔊 Listen</div>
      <button class="sound-btn" onclick="speak('${current}')">🔁 Repeat Word</button>
    `;
    speak(current);

    correct = data[current].def;
    answers.push(correct);

    while (answers.length < 4) {
      const r = data[keys[Math.floor(Math.random() * keys.length)]].def;
      if (!answers.includes(r)) answers.push(r);
    }
  }

  // MODE 3 — Listen DEFINITION → Persian
  if (mode === 3) {
    m.innerText = "🎧 Definition → Persian";
    q.innerHTML = `
      <div class="big-word">🔊 Listen</div>
      <button class="sound-btn" onclick="speak('${data[current].def}')">🔁 Repeat Definition</button>
    `;
    speak(data[current].def);

    correct = data[current].fa;
    answers.push(correct);

    while (answers.length < 4) {
      const r = data[keys[Math.floor(Math.random() * keys.length)]].fa;
      if (!answers.includes(r)) answers.push(r);
    }
  }

  answers.sort(() => Math.random() - 0.5);

  answers.forEach(a => {
    const b = document.createElement("button");
    b.className = "choice-btn";
    b.innerText = a;
    b.onclick = () => check(b, a, correct);
    c.appendChild(b);
  });
}

// CHECK ANSWER
function check(btn, ans, correct) {
  if (ans === correct) {
    btn.style.background = "#c8f7c5";
  } else {
    btn.style.background = "#f7c5c5";

    let l = JSON.parse(localStorage.getItem("leitner")) || {};
    l[current] = { box: 1, last: Date.now() };
    localStorage.setItem("leitner", JSON.stringify(l));
  }

  setTimeout(nextQuestion, 900);
}
