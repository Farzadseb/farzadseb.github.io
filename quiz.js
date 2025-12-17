<script>
let data = {};
let validKeys = [];
let currentWord = "";

fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(j => {
    data = j;

    // فقط لغت‌هایی که fa دارند
    validKeys = Object.keys(data).filter(
      k => data[k] && data[k].fa
    );

    nextQuestion();
  });

function nextQuestion() {
  currentWord = validKeys[Math.floor(Math.random() * validKeys.length)];
  document.getElementById("question").innerText = currentWord;

  const correct = data[currentWord].fa;
  let options = [correct];

  while (options.length < 4) {
    const r = validKeys[Math.floor(Math.random() * validKeys.length)];
    const f = data[r].fa;
    if (!options.includes(f)) options.push(f);
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
  if (ans === data[currentWord].fa) {
    alert("✅ Correct");
  } else {
    alert("❌ Wrong → goes to Leitner");
    addWrongToLeitner(currentWord);
  }
  nextQuestion();
}

function addWrongToLeitner(word) {
  let l = JSON.parse(localStorage.getItem("leitner")) || {};
  l[word] = { box: 1, last: Date.now() };
  localStorage.setItem("leitner", JSON.stringify(l));
}
</script>
