let data = {};
let keys = [];
let current = "";
let mode = 1;
let speakText = "";

fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(j => {
    data = j.words || j;
    keys = Object.keys(data);
    nextQuestion();
  });

function speak(text){
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.75;
  speechSynthesis.speak(u);
}

document.getElementById("listen").onclick = () => {
  if(speakText) speak(speakText);
};

function nextQuestion(){
  if(keys.length < 4) return;

  mode = Math.floor(Math.random()*3)+1;
  current = keys[Math.floor(Math.random()*keys.length)];

  const q = document.getElementById("question");
  const c = document.getElementById("choices");
  const m = document.getElementById("modeBox");

  q.innerHTML = "";
  c.innerHTML = "";

  let answers = [];
  let correct = "";

  // 1️⃣ English → Persian
  if(mode === 1){
    m.innerText = "🎧 English → Persian";
    q.innerText = current;
    speakText = current;
    speak(current);

    correct = data[current].fa;
    answers.push(correct);

    while(answers.length<4){
      const r = data[keys[Math.floor(Math.random()*keys.length)]].fa;
      if(!answers.includes(r)) answers.push(r);
    }
  }

  // 2️⃣ English → Definition
  if(mode === 2){
    m.innerText = "🎧 English → Definition";
    q.innerText = "Listen";
    speakText = current;
    speak(current);

    correct = data[current].def;
    answers.push(correct);

    while(answers.length<4){
      const r = data[keys[Math.floor(Math.random()*keys.length)]].def;
      if(!answers.includes(r)) answers.push(r);
    }
  }

  // 3️⃣ Definition → Persian
  if(mode === 3){
    m.innerText = "🎧 Definition → Persian";
    q.innerText = "Listen";
    speakText = data[current].def;
    speak(speakText);

    correct = data[current].fa;
    answers.push(correct);

    while(answers.length<4){
      const r = data[keys[Math.floor(Math.random()*keys.length)]].fa;
      if(!answers.includes(r)) answers.push(r);
    }
  }

  answers.sort(()=>Math.random()-0.5);

  answers.forEach(a=>{
    const b=document.createElement("button");
    b.innerText=a;
    b.onclick=()=>{
      if(a===correct){
        b.style.background="#9be7a4";
      }else{
        b.style.background="#f5a3a3";
      }
      setTimeout(nextQuestion,700);
    };
    c.appendChild(b);
  });
}
