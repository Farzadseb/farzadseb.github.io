let data = {};
let isMuted = false;

const RATE = 0.7;
const LANG = "en-US";

const muteBtn = document.getElementById("muteBtn");
const voiceSelect = document.getElementById("audioVoice");

let voices = [];
let selectedVoiceURI = localStorage.getItem("voiceURI") || "";

// ---------- Load dictionary ----------
fetch("pdcs_a1.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    console.log("Dictionary loaded:", Object.keys(data).length);
  })
  .catch(err => console.error("JSON load error:", err));

// ---------- Mute ----------
isMuted = (localStorage.getItem("muted") === "1");
renderMute();

muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  localStorage.setItem("muted", isMuted ? "1" : "0");
  renderMute();
});

function renderMute(){
  if(isMuted){
    muteBtn.textContent = "🔇 Sound: OFF";
    muteBtn.classList.add("on");
  }else{
    muteBtn.textContent = "🔊 Sound: ON";
    muteBtn.classList.remove("on");
  }
}

// ---------- Voices (optional) ----------
function loadVoices(){
  voices = window.speechSynthesis?.getVoices?.() || [];
  // پاک کردن گزینه‌های قبلی (به جز Auto)
  const keepAuto = voiceSelect.options[0];
  voiceSelect.innerHTML = "";
  voiceSelect.appendChild(keepAuto);

  // فقط en-US و نزدیک‌ها رو بیار بالا
  const sorted = [...voices].sort((a,b)=> (a.lang||"").localeCompare(b.lang||""));
  for(const v of sorted){
    const opt = document.createElement("option");
    opt.value = v.voiceURI;
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  }

  if(selectedVoiceURI){
    voiceSelect.value = selectedVoiceURI;
  }
}

if ("speechSynthesis" in window) {
  loadVoices();
  // بعضی مرورگرها دیر لود می‌کنن
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

voiceSelect.addEventListener("change", () => {
  selectedVoiceURI = voiceSelect.value || "";
  localStorage.setItem("voiceURI", selectedVoiceURI);
});

// ---------- Speak helper ----------
function pickVoice(){
  if(!voices?.length) return null;

  // اگر کاربر انتخاب کرده
  if(selectedVoiceURI){
    const chosen = voices.find(v => v.voiceURI === selectedVoiceURI);
    if(chosen) return chosen;
  }

  // تلاش برای صدای زنانه/طبیعی (نام‌ها در هر دستگاه فرق دارند)
  const preferred = voices.find(v =>
    (v.lang === "en-US") &&
    /Samantha|Karen|Tessa|Ava|Allison|Victoria|Female/i.test(v.name)
  );
  if(preferred) return preferred;

  // fallback: هر چی en-US بود
  const us = voices.find(v => v.lang === "en-US");
  if(us) return us;

  // fallback: اولین voice
  return voices[0] || null;
}

function speak(text){
  if(isMuted) return;
  if(!("speechSynthesis" in window)) return;

  const clean = (text || "").toString().trim();
  if(!clean) return;

  // توقف قبلی برای اینکه قاطی نشه
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(clean);
  u.lang = LANG;
  u.rate = RATE;
  u.pitch = 1.0;

  const v = pickVoice();
  if(v) u.voice = v;

  window.speechSynthesis.speak(u);
}

// ---------- Search ----------
function escapeHTML(s){
  return (s || "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function searchWord() {
  const inputRaw = document.getElementById("searchInput").value.trim();
  const input = inputRaw.toLowerCase();
  const result = document.getElementById("result");
  result.innerHTML = "";

  if (!data || !data[input]) {
    result.innerHTML = "<p style='font-size:22px'>❌ Not found</p>";
    return;
  }

  const w = data[input];

  // example can be object or string
  let exEn = "";
  let exFa = "";
  if (typeof w.example === "string") {
    exEn = w.example;
  } else if (typeof w.example === "object" && w.example) {
    exEn = w.example.en || "";
    exFa = w.example.fa || "";
  }

  let html = `
    <div class="card">
      <div class="word tts" data-tts="${escapeHTML(input)}">${escapeHTML(input)}</div>
      ${w.fa ? `<div class="fa">${escapeHTML(w.fa)}</div>` : ""}

      <div class="section">
        <div class="section-title">Definition</div>
        <div class="box">
          <div class="en tts" data-tts="${escapeHTML(w.def || "")}">${escapeHTML(w.def || "")}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Example</div>
        <div class="box">
          <div class="en tts" data-tts="${escapeHTML(exEn)}">${escapeHTML(exEn)}</div>
          ${exFa ? `<div class="fa-text">${escapeHTML(exFa)}</div>` : ""}
        </div>
      </div>
  `;

  // collocations
  if (Array.isArray(w.collocations) && w.collocations.length) {
    html += `<div class="section"><div class="section-title">Collocations</div>`;
    w.collocations.forEach(c => {
      const cen = c?.en || "";
      const cfa = c?.fa || "";
      html += `
        <div class="box">
          <div class="en tts" data-tts="${escapeHTML(cen)}">${escapeHTML(cen)}</div>
          ${cfa ? `<div class="fa-text">${escapeHTML(cfa)}</div>` : ""}
        </div>
      `;
    });
    html += `</div>`;
  }

  // phrases
  if (Array.isArray(w.phrases) && w.phrases.length) {
    html += `<div class="section"><div class="section-title">Phrases</div>`;
    w.phrases.forEach(p => {
      const pen = p?.en || "";
      const pfa = p?.fa || "";
      html += `
        <div class="box">
          <div class="en tts" data-tts="${escapeHTML(pen)}">${escapeHTML(pen)}</div>
          ${pfa ? `<div class="fa-text">${escapeHTML(pfa)}</div>` : ""}
        </div>
      `;
    });
    html += `</div>`;
  }

  // phrasal verbs
  if (Array.isArray(w.phrasal_verbs) && w.phrasal_verbs.length) {
    html += `<div class="section"><div class="section-title">Phrasal Verbs</div>`;
    w.phrasal_verbs.forEach(pv => {
      const pen = pv?.en || "";
      const pfa = pv?.fa || "";
      html += `
        <div class="box">
          <div class="en tts" data-tts="${escapeHTML(pen)}">${escapeHTML(pen)}</div>
          ${pfa ? `<div class="fa-text">${escapeHTML(pfa)}</div>` : ""}
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `</div>`;
  result.innerHTML = html;

  // ✅ تلفظ خودِ کلمه بلافاصله بعد از سرچ (Enter = gesture => روی موبایل معمولاً کار می‌کند)
  speak(input);

  // ✅ هرچیزی که کلاس tts دارد، با لمس/کلیک تلفظ می‌شود
  bindTTS();
}

// ---------- Bind TTS on tap ----------
function bindTTS(){
  const nodes = document.querySelectorAll(".tts");
  nodes.forEach(n => {
    n.style.cursor = "pointer";
    n.addEventListener("click", () => {
      const t = n.getAttribute("data-tts") || n.textContent;
      speak(t);
    }, { passive: true });

    // برای بعضی موبایل‌ها touchstart بهتره
    n.addEventListener("touchstart", () => {
      const t = n.getAttribute("data-tts") || n.textContent;
      speak(t);
    }, { passive: true });
  });
}

// expose for inline Enter handler
window.searchWord = searchWord;
