let dictionary = {};
let mute = false;

fetch("pdcs_a1.json")
  .then(res => res.json())
  .then(data => dictionary = data);

function searchWord() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const result = document.getElementById("result");
  const item = dictionary[input];

  if (!item) {
    result.innerHTML = "❌ Not found in dictionary";
    return;
  }

  result.innerHTML = `
    <div class="word">${input}</div>
    <div class="meaning"><b>FA:</b> ${item.fa}</div>
    <div class="meaning"><b>EN:</b> ${item.definition}</div>

    <div class="example">
      <b>Example:</b><br>
      ${item.example_en}<br>
      ${item.example_fa}
    </div>

    <div>
      ${item.collocations.map(c => `<span class="tag">${c}</span>`).join("")}
      ${item.phrasal.map(p => `<span class="tag">${p}</span>`).join("")}
    </div>
  `;

  if (!mute) speak(input);
}

function speak(word) {
  const u = new SpeechSynthesisUtterance(word);
  u.lang = "en-US";
  u.rate = 0.7;
  speechSynthesis.speak(u);
}
