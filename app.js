// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const pdfInput = document.getElementById("pdfInput");
const viewer = document.getElementById("pdfViewer");
const popup = document.getElementById("popup");
const toast = document.getElementById("toast");

// dictionary
let dictionary = {};
let femaleVoice = null;

fetch("pdcs_a1_sample.json")
  .then(res => res.json())
  .then(data => dictionary = data);

// voices
function loadVoices() {
  const voices = speechSynthesis.getVoices();
  femaleVoice = voices.find(v => v.lang === "en-US");
}
speechSynthesis.onvoiceschanged = loadVoices;

// helpers
function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 3000);
}

function normalize(w) {
  return w.toLowerCase().replace(/[^a-z']/g, "");
}

function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.7;
  if (femaleVoice) u.voice = femaleVoice;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function showPopup(word) {
  const item = dictionary[word];
  popup.innerHTML = item
    ? `
      <div class="w">${word}</div>
      <div class="fa">${item.fa}</div>
      <div class="en">${item.en || ""}</div>
    `
    : `
      <div class="w">${word}</div>
      <div class="fa">در دیکشنری نیست</div>
    `;
  popup.style.display = "block";
  speak(word);
}

// render PDF
pdfInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  viewer.innerHTML = "";
  popup.style.display = "none";

  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.4 });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    viewer.appendChild(canvas);
    await page.render({ canvasContext: ctx, viewport }).promise;
  }

  showToast("متن را لمس کن و یک کلمه را انتخاب کن");
});

// selection listener (THIS is the key)
document.addEventListener("selectionchange", () => {
  const sel = window.getSelection().toString().trim();
  if (!sel) return;

  const word = normalize(sel);
  if (!word) return;

  showPopup(word);
});
