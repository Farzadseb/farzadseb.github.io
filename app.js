<script>
  let DICTIONARY = {};

  /* ---------- Load Dictionary ---------- */
  fetch("pdcs_a1_sample.json")
    .then(res => res.json())
    .then(data => {
      DICTIONARY = data.dictionary || data;
      console.log("Dictionary loaded");
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

    const voices = speechSynthesis.getVoices();
    const female = voices.find(v =>
      v.lang === "en-US" && /female|woman/i.test(v.name)
    );
    if (female) u.voice = female;

    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  /* ---------- UI ---------- */
  function showMeaning(wordKey, entry) {
    let box = document.getElementById("meaningBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "meaningBox";
      document.querySelector(".container").appendChild(box);
    }

    if (!entry) {
      box.innerHTML = `
        <div style="font-size:1.3rem;font-weight:700">${wordKey}</div>
        <div style="margin-top:8px;color:#666">
          این کلمه هنوز در دیکشنری نیست
        </div>
      `;
      speak(wordKey);
      return;
    }

    const ex = entry.examples && entry.examples[0];

    box.innerHTML = `
      <div style="font-size:1.6rem;font-weight:800">${entry.word}</div>
      <div style="font-size:1.3rem;margin-top:6px">${entry.fa}</div>
      <div style="font-size:1.15rem;margin-top:6px;color:#444">${entry.en}</div>
      ${ex ? `
        <hr>
        <div style="font-size:1.1rem">${ex.en}</div>
        <div style="font-size:1.1rem;color:#555">${ex.fa}</div>
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

      span.addEventListener("click", () => {
        if (!clean) return;
        const entry = DICTIONARY[clean];
        showMeaning(clean, entry);
      });

      container.appendChild(span);
    });
  }
</script>
