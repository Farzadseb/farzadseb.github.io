const pdfInput = document.getElementById("pdfInput");
const viewer = document.getElementById("viewer");
const popup = document.getElementById("popup");

let dictionary = {};

fetch("pdcs_a1_sample.json")
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
      span.onclick = () => lookup(w.toLowerCase());
      div.appendChild(span);
    });

    viewer.appendChild(div);
  }
});

function lookup(word) {
  const d = dictionary[word];
  if (!d) {
    popup.style.display = "block";
    popup.innerHTML = `<b>${word}</b>❌ Not in dictionary`;
    return;
  }

  popup.style.display = "block";
  popup.innerHTML = `
    <b>${word}</b>
    <div><b>فارسی:</b> ${d.fa}</div>
    <div><b>Definition:</b> ${d.definition}</div>
    <div><b>Example:</b> ${d.example}</div>
  `;
}
