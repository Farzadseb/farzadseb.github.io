function searchWord() {
  let w = document.getElementById("search").value
            .trim()
            .toLowerCase();   // 🔑 این خط نجات‌دهنده است

  let result = document.getElementById("result");

  if (!DICT[w]) {
    alert("Not in dictionary");
    return;
  }

  let d = DICT[w];

  result.innerHTML = `
    <h2>${w}</h2>
    <p>🇮🇷 ${d.fa}</p>
    <p>📖 ${d.definition}</p>
    <p>✏️ ${d.example}</p>
  `;
}
