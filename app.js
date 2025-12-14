let dictionary = {};

fetch("pdcs_a1_sample.json")
  .then(res => res.json())
  .then(data => {
    dictionary = data;
  });

const input = document.getElementById("search");
const result = document.getElementById("result");

input.addEventListener("input", () => {
  const word = input.value.trim().toLowerCase();

  if (!word || !dictionary[word]) {
    result.innerHTML = "";
    return;
  }

  const item = dictionary[word];

  result.innerHTML = `
    <div class="card">
      <div class="word" onclick="speak('${word}')">${word}</div>
      <div class="fa">${item.fa}</div>
      <div class="en">${item.definition}</div>
      <div class="example">${item.example}</div>
    </div>
  `;
});

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.5;

  const voices = speechSynthesis.getVoices();
  const female = voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("female"));
  if (female) utter.voice = female;

  speechSynthesis.speak(utter);
}
