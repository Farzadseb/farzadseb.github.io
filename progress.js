// progress.js — FULL A1 LEITNER ENGINE

let L = JSON.parse(localStorage.getItem("leitner") || "{}");

let total = Object.keys(L).length;
let boxes = [0,0,0,0,0];
let due = 0;
let now = Date.now();

for(let w in L){
  let b = L[w].box || 1;
  boxes[b-1]++;

  let days = [1,2,4,7,999][b-1];
  if(now - L[w].last > days*86400000){
    due++;
  }
}

document.getElementById("total").innerText = total;
document.getElementById("due").innerText = due;

for(let i=0;i<5;i++){
  document.getElementById("box"+(i+1)).innerText = boxes[i];
}
