// -------- PDF.js Worker --------
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const pdfInput = document.getElementById("pdfInput");
const viewer = document.getElementById("pdfViewer");
const popup = document.getElementById("popup");
const toast = document.getElementById("toast");

// -------- Your dictionary (same file as before) --------
let dictionary = {};
let femaleVoice = null;

fetch("pdcs_a1_sample.json")
  .then(res => res.json())
  .then(data => { dictionary = data; });

// voices (best-effort)
function loadVoices() {
  const voices = speechSynthesis.getVoices();
  femaleVoice = voices.find(v =>
    v.lang === "en-US" &&
    /female|woman|zira|samantha|karen|allison/i.test(v.name)
  );
}
speechSynthesis.onvoiceschanged = loadVoices;

// -------- Helpers --------
function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3500);
}

function normalizeWord(raw) {
  if (!raw) return "";
  return raw
    .trim()
    .toLowerCase()
    .replace(/^[^a-z']+|[^a-z']+$/g, ""); // حذف علائم ابتدا/انتها
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.7;
  utter.pitch = 1;
  if (femaleVoice) utter.voice = femaleVoice;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

function showPopup(word, item) {
  const exEn = item?.examples?.[0]?.en || item?.example || "";
  const exFa = item?.examples?.[0]?.fa || "";

  popup.innerHTML = `
    <div class="w" id="popupWord">${word}</div>
    <div class="fa">${item?.fa || "—"}</div>
    <div class="en">${item?.en || item?.definition || ""}</div>
    <div class="ex">${exEn}${exFa ? "<br/>" + exFa : ""}</div>
    <div class="hint">Tip: tap the word to hear it (US, rate 0.7)</div>
  `;
  popup.style.display = "block";

  document.getElementById("popupWord").onclick = () => speak(word);

  // auto hide after a bit (but keep if user continues tapping)
  clearTimeout(showPopup._t);
  showPopup._t = setTimeout(() => (popup.style.display = "none"), 6000);
}

// -------- Build text layer (clickable) --------
function buildTextLayer(page, viewport, container) {
  const textLayerDiv = document.createElement("div");
  textLayerDiv.className = "textLayer";
  container.appendChild(textLayerDiv);

  return page.getTextContent().then(textContent => {
    if (!textContent.items || textContent.items.length === 0) {
      showToast("این PDF متن قابل انتخاب ندارد (ممکن است اسکن/عکس باشد).");
      return;
    }

    // Create spans for each text item
    for (const item of textContent.items) {
      const span = document.createElement("span");
      span.textContent = item.str;

      // PDF.js position math
      const tx = pdfjsLib.Util.transform(
        pdfjsLib.Util.transform(viewport.transform, item.transform),
        [1, 0, 0, -1, 0, 0]
      );

      const x = tx[4];
      const y = tx[5];

      const fontHeight = Math.hypot(tx[2], tx[3]);
      const fontWidthScale = Math.hypot(tx[0], tx[1]);

      span.style.left = `${x}px`;
      span.style.top = `${y - fontHeight}px`;
      span.style.fontSize = `${fontHeight}px`;
      span.style.transform = `scaleX(${fontWidthScale})`;

      // click/tap handler
      span.addEventListener("click", (e) => {
        e.preventDefault();
        const w = normalizeWord(span.textContent);
        if (!w) return;

        const item = dictionary[w];
        if (item) {
          showPopup(w, item);
          speak(w);
        } else {
          showPopup(w, { fa: "در دیکشنری نیست", en: "", examples: [] });
          speak(w);
        }
      });

      textLayerDiv.appendChild(span);
    }
  });
}

// -------- Render PDF --------
pdfInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  viewer.innerHTML = "";
  popup.style.display = "none";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    // scale tuned for mobile
    const viewport = page.getViewport({ scale: 1.35 });

    const pageWrap = document.createElement("div");
    pageWrap.className = "page";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    pageWrap.appendChild(canvas);
    viewer.appendChild(pageWrap);

    await page.render({ canvasContext: ctx, viewport }).promise;

    // clickable text layer on top
    await buildTextLayer(page, viewport, pageWrap);
  }

  showToast("PDF آماده است. روی کلمات بزن.");
});
