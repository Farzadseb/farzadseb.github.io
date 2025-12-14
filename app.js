let dictionary = {};

// بارگذاری دیکشنری
fetch("pdcs_a1_sample.json")
  .then(res => res.json())
  .then(data => {
    dictionary = data;
  });

// عناصر صفحه
const input = document.getElementById("search");
const result = document.getElementById("result");

// جستجو هنگام تایپ
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

// تلفظ (US – سرعت آموزشی)
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.7;   // 👈 دقیقاً طبق خواسته‌ات
  utter.pitch = 1;

  speechSynthesis.cancel(); // جلوگیری از هم‌پوشانی صدا
  speechSynthesis.speak(utter);
}
