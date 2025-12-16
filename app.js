let dictionary = {};

fetch("pdcs_a1.json")
  .then(res => res.json())
  .then(data => dictionary = data);

function searchWord() {
  const word = document.getElementById("searchInput").value.trim().toLowerCase();
  const r = document.getElementById("result");
  r.innerHTML = "";

  if (!dictionary[word]) {
    r.innerHTML = "<p>❌ Not found</p>";
    return;
  }

  saveToLeitner(word);

  const d = dictionary[word];
  r.innerHTML = `
    <div class="card">
      <h2>${word}</h2>
      <p><strong>FA:</strong> ${d.fa}</p>
      <p><strong>Definition:</strong> ${d.def}</p>
      <p><strong>Example:</strong> ${d.example}</p>
      ${d.collocations.map(c=>`<small>${c.en} — ${c.fa}</small>`).join("<br>")}
    </div>
  `;

  speak(word);
}

function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.7;
  speechSynthesis.speak(u);
}

// Leitner
function saveToLeitner(word) {
  const l = JSON.parse(localStorage.getItem("leitner") || "{}");
  if (!l[word]) l[word] = {box:1};
  localStorage.setItem("leitner", JSON.stringify(l));
}
