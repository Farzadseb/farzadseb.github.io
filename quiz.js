let data = {};
let keys = [];
let currentWord = "";
let mode = 1; // 1,2,3

fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(j => {
    data = j;
    keys = Object.keys(data);
    nextQuestion();
  });

function speak(text) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.7;
  speechSynthesis.speak(u);
}

function nextQuestion() {
  if (keys.length < 4) {
    alert("Dictionary too small");
    return;
  }

  mode = Math.floor(Math.random() * 3) + 1;
  currentWord = keys[Math.floor(Math.random() * keys.length)];

  const q = document.getElementById("question");
  const c = document.getElementById("choices");
  const m = document.getElementById("modeBox");

  c.innerHTML = "";
  q.innerHTML = "";

  let answers = [];

  if (mode === 1) {
    m.innerText = "English → Persian";
    q.innerText = currentWord;
    speak(currentWord);

    answers.push(data[currentWord].fa);
    while (answers.length < 4) {
      const r = keys[Math.floor(Math.random() * keys.length)];
      if (!answers.includes(data[r].fa)) answers.push(data[r].fa);
    }
  }

  if (mode === 2) {
    m.innerText = "Definition → Word";
    q.innerText = data[currentWord].def;
    speak(data[currentWord].def);

    answers.push(currentWord);
    while (answers.length < 4) {
      const r = keys[Math.floor(Math.random() * keys.length)];
      if (!answers.includes(r)) answers.push(r);
    }
  }

  if (mode === 3) {
    m.innerText = "Listening → Persian";
    q.innerText = "🔊 Listen";
    speak(currentWord);

    answers.push(data[currentWord].fa);
    while (answers.length < 4) {
      const r = keys[Math.floor(Math.random() * keys.length)];
      if (!answers.includes(data[r].fa)) answers.push(data[r].fa);
    }
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
  let correct =
    (mode === 1 || mode === 3) ? data[currentWord].fa :
    currentWord;

  if (ans === correct) {
    alert("✅ Correct");
  } else {
    alert("❌ Wrong → Leitner");
    let l = JSON.parse(localStorage.getItem("leitner")) || {};
    l[currentWord] = { box: 1, last: Date.now() };
    localStorage.setItem("leitner", JSON.stringify(l));
  }
}
