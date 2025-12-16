let words=[],i=0,score=0;

fetch("pdcs_a1.json")
.then(r=>r.json())
.then(d=>{
  words = Object.keys(d).map(w=>({w,fa:d[w].fa}));
  words.sort(()=>Math.random()-0.5);
  show();
});

function show(){
  if(i>=10){
    document.getElementById("q").innerHTML = `Score: ${score}/10`;
    return;
  }
  const q = words[i];
  const opts = [q.fa];
  while(opts.length<4){
    const r = words[Math.floor(Math.random()*words.length)].fa;
    if(!opts.includes(r)) opts.push(r);
  }
  opts.sort(()=>Math.random()-0.5);

  document.getElementById("q").innerHTML = `
    <h2>${q.w}</h2>
    ${opts.map(o=>`<button onclick="check('${o}','${q.fa}')">${o}</button>`).join("")}
  `;
}

function check(a,b){
  if(a===b) score++;
  i++; show();
}
function next(){ i++; show(); }
