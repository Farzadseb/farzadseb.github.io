<script>
  let WORD_MAP = {};

  /* ---------- Load Dictionary & Build Word Map ---------- */
  fetch("pdcs_a1_sample.json")
    .then(res => res.json())
    .then(data => {
      const dict = data.dictionary || data;

      Object.values(dict).forEach(entry => {
        if (entry.word) {
          WORD_MAP[entry.word.toLowerCase()] = entry;
        }
      });

      console.log("Word map ready:", Object.keys(WORD_MAP).length);
    });

  /* ---------- Helpers ---------- */
  function normalize(word) {
    return word
      .toLowerCase()
      .replace(/[^a-z']/g, "")
      .trim();
  }

  function speak(word) {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    u.rate = 0.7;

    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  /* ---------- UI ---------- */
  function showMeaning(word, entry) {
    let box = document.getElementById("meaningBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "meaningBox";
      box.style.marginTop = "16px";
      document.querySelector(".container").appendChild(box);
    }

    if (!entry) {
      box.innerHTML = `
        <div style="font-size:1.4rem;font-weight:700">${word}</div>
        <div style="margin-top:6px;color:#777">
          این کلمه هنوز در دیکشنری نیست
        </div>
      `;
      speak(word);
      return;
    }

    const ex = entry.examples && entry.examples[0];

    box.innerHTML = `
      <div style="font-size:1.6rem;font-weight:800">${entry.word}</div>
      <div style="font-size:1.3rem;margin-top:6px">${entry.fa}</div>
      <div style="font-size:1.15rem;margin-top:6px;color:#444">${entry.en}</div>
      ${ex ? `
        <hr>
        <div>${ex.en}</div>
        <div style="color:#555">${ex.fa}</div>
      ` : ""}
    `;

    speak(entry.word);
  }

  /* ---------- Render Clickable Text ---------- */
  function renderClickableText(text) {
    const container = document.getElementById("pdfText");
    container.innerHTML = "";

    text.split(/\s+/).forEach(raw => {
      const clean = normalize(raw);
      const span = document.createElement("span");
      span.textContent = raw + " ";
      span.className = "word";

      span.onclick = () => {
        if (!clean) return;
        const entry = WORD_MAP[clean];
        showMeaning(clean, entry);
      };

      container.appendChild(span);
    });
  }
</script>
