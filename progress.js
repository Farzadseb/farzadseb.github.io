const l = JSON.parse(localStorage.getItem("leitner") || "{}");
const list = document.getElementById("list");

if (!Object.keys(l).length) {
  list.innerHTML = "<p>No words yet.</p>";
}

Object.keys(l).forEach(w=>{
  const d = document.createElement("div");
  d.className = "card";
  d.innerHTML = `
    <strong>${w}</strong><br>
    Box: ${l[w].box}<br><br>
    <button onclick="up('${w}')">✅ Know</button>
    <button onclick="down('${w}')">❌ Forget</button>
  `;
  list.appendChild(d);
});

function up(w){
  l[w].box = Math.min(5, l[w].box+1);
  save();
}
function down(w){
  l[w].box = 1;
  save();
}
function save(){
  localStorage.setItem("leitner", JSON.stringify(l));
  location.reload();
}
