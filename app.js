let dictionary = {};
let femaleVoice = null;

// بارگذاری دیکشنری
fetch("pdcs_a1_sample.json")
  .then(res => res.json())
  .then(data => {
    dictionary = data;
  });

// گرفتن صداها (با تأخیر – مخصوص Safari)
function loadVoices() {
  const voices = speechSynthesis.getVoices();
  femaleVoice = voices.find(v =>
    v.lang === "en-US" &&
    /female|woman|zira|samantha|karen|allison/i.test(v.name)
  );
}
speechSynthesis.onvoiceschanged = loadVoices;

// عناصر
const input = document.getElementById("search");
const result = document.getElementById("result");

// جستجو
input.addEventListener("input", () => {
  const word = input.value.trim().toLowerCase();

  if (!word || !dictionary[word]) {
    result.innerHTML = "";
    return;
  }

  const item = dictionary[word];
  const exEn = item.examples?.[0]?.en || "";
  const exFa = item.examples?.[0]?.fa || "";

  result.innerHTML = `
    <div class="card">
      <div class="word" onclick="speak('${word}')">${word}</div>
      <div class="fa">${item.fa}</div>
      <div class="en">${item.en}</div>
      <div class="example">
        ${exEn}<br/>
        ${exFa}
      </div>
    </div>
  `;
});

// تلفظ
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.7;
  utter.pitch = 1;

  if (femaleVoice) {
    utter.voice = femaleVoice; // 🎯 اگر زنانه بود
  }

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}
