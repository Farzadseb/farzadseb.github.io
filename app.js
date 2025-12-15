/******** CONFIG ********/
const DICT_URL = "pdcs_a1.json";

const TELEGRAM_BOT_TOKEN = "8553224514:AAG0XXzA8da55jCGXnzStP-0IxHhnfkTPRw";
const TELEGRAM_CHAT_ID = "96991859";
let REPORT_ENABLED = true;

/******** GLOBALS ********/
let DICT = {};
let currentWord = null;

/******** LOAD DICT ********/
fetch(DICT_URL)
.then(r=>r.json())
.then(d=>DICT=d);

/******** SEARCH ********/
function searchWord(){
  let w=document.getElementById("search").value.trim().toLowerCase();
  if(!DICT[w]){
    result.innerHTML="❌ Not found";
    return;
  }
  currentWord=w;
  show(DICT[w]);
  speak(w);
  track(w);
}

/******** SHOW ********/
function show(o){
  result.innerHTML=`
    <div class="word">${currentWord}</div>
    <div class="fa">${o.fa}</div>
    <div class="def">${o.definition}</div>
    <div class="example">Example: ${o.example||""}</div>
    <button onclick="saveWord()">⭐ Save</button>
  `;
}

/******** SPEAK ********/
function speak(w){
  let u=new SpeechSynthesisUtterance(w);
  u.lang="en-US";
  u.rate=0.7;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

/******** SAVE WORD ********/
function saveWord(){
  let s=JSON.parse(localStorage.getItem("savedWords")||"{}");
  s[currentWord]=true;
  localStorage.setItem("savedWords",JSON.stringify(s));
  report(`⭐ Saved: ${currentWord}`);
}

/******** TRACK ********/
function track(w){
  let t=JSON.parse(localStorage.getItem("seenWords")||"{}");
  t[w]=(t[w]||0)+1;
  localStorage.setItem("seenWords",JSON.stringify(t));
}

/******** MATCH ********/
function startMatch(level){
  report(`🎮 Match started ${level}`);
  setTimeout(()=>aiMatch(level),30000);
}
function aiMatch(level){
  let score=Math.floor(Math.random()*5)+1;
  finish(level,score);
}
function finish(level,score){
  let b=JSON.parse(localStorage.getItem("leaderboard")||"[]");
  b.push({level,score,total:5,date:new Date().toISOString()});
  localStorage.setItem("leaderboard",JSON.stringify(b));
  report(`🏁 ${level} score: ${score}/5`);
  alert(`Score ${score}/5`);
}

/******** TELEGRAM ********/
function report(text){
  if(!REPORT_ENABLED)return;
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({chat_id:TELEGRAM_CHAT_ID,text})
  });
}
