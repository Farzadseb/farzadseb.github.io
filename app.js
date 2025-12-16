let data = {};

fetch("pdcs_a1.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    console.log("Dictionary loaded:", Object.keys(data).length);
  })
  .catch(err => {
    console.error("JSON load error:", err);
  });

function searchWord() {
  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  const result = document.getElementById("result");
  result.innerHTML = "";

  if (!data[input]) {
    result.innerHTML = "<p>❌ Not found</p>";
    return;
  }

  const w = data[input];

  let html = `
    <div class="card">
      <div class="word">${input}</div>
      <div class="fa-text-main">${w.fa || ""}</div>

      <div class="section">
        <div class="section-title">Definition</div>
        <div class="box">
          <div class="en">${w.def || ""}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Example</div>
        <div class="box">
          <div class="en">${w.example?.en || ""}</div>
          <div class="fa-text">${w.example?.fa || ""}</div>
        </div>
      </div>
  `;

  if (Array.isArray(w.collocations)) {
    html += `<div class="section"><div class="section-title">Collocations</div>`;
    w.collocations.forEach(c => {
      html += `
        <div class="box">
          <div class="en">${c.en}</div>
          <div class="fa-text">${c.fa}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  if (Array.isArray(w.phrases)) {
    html += `<div class="section"><div class="section-title">Phrases</div>`;
    w.phrases.forEach(p => {
      html += `
        <div class="box">
          <div class="en">${p.en}</div>
          <div class="fa-text">${p.fa}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  if (Array.isArray(w.phrasal_verbs)) {
    html += `<div class="section"><div class="section-title">Phrasal Verbs</div>`;
    w.phrasal_verbs.forEach(pv => {
      html += `
        <div class="box">
          <div class="en">${pv.en}</div>
          <div class="fa-text">${pv.fa}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `</div>`;
  result.innerHTML = html;
}
