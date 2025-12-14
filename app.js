let mode = "personal";
const viewer = document.getElementById("viewer");
const popup = document.getElementById("popup");
const pdfInput = document.getElementById("pdfInput");

let dictionary = {};
let saved = JSON.parse(localStorage.getItem("savedWords") || "{}");

fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(d => dictionary = d);

pdfInput.addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  viewer.innerHTML = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await page.getTextContent();
    const div = document.createElement("div");

    text.items.forEach(item => {
      const w = item.str.trim();
      if (!w) return;

      const span = document.createElement("span");
      span.textContent = w + " ";
      span.className = "word";
      span.onclick = () => onWord(w.toLowerCase());
      div.appendChild(span);
    });

    viewer.appendChild(div);
  }
});

function onWord(word) {
  speak(word);
  if (dictionary[word]) {
    popup.style.display = "block";
    popup.innerHTML = `
      <b>${word}</b><br>
      ${dictionary[word].fa}<br>
      <small>${dictionary[word].definition}</small>
    `;
    saved[word] = true;
    localStorage.setItem("savedWords", JSON.stringify(saved));
  } else {
    popup.style.display = "block";
    popup.innerHTML = `<b>${word}</b><br>Not in dictionary`;
  }
}

function speak(word) {
  const u = new SpeechSynthesisUtterance(word);
  u.lang = "en-US";
  u.rate = 0.5;

  const voices = speechSynthesis.getVoices();
  const femaleUS = voices.find(v =>
    v.lang === "en-US" &&
    (v.name.toLowerCase().includes("female") ||
     v.name.toLowerCase().includes("woman"))
  );
  if (femaleUS) u.voice = femaleUS;

  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function showSaved() {
  viewer.innerHTML = "<h3>Saved Words</h3>";
  Object.keys(saved).forEach(w => {
    const d = document.createElement("div");
    d.textContent = w;
    d.onclick = () => onWord(w);
    viewer.appendChild(d);
  });
}
