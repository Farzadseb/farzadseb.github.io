let data = {};
let words = [];
let currentWord = "";
let mode = 1;
let locked = false;

fetch("pdcs_a1.json")
  .then(r => r.json())
  .then(j => {
    data = j.words;
    words = Object.keys(data);
    nextQuestion();
  });

function speak(text){
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.7;
  speechSynthesis.speak(u);
}

function nextQuestion(){
  locked = false;
  document.getElementById("choices").innerHTML = "";

  mode = Math.floor(Math.random()*3)+1;
  currentWord = words[Math.floor(Math.random()*words.length)];
  const w = data[currentWord];

  const q = document.getElementById("question");
  const m = document.getElementById("modeBox");

  let answers = [];
  let correct = "";

  /* MODE 1: English → Persian */
  if(mode===1){
    m.innerText = "English → Persian";
    q.innerText = currentWord;
    speak(currentWord);
    correct = w.fa;
    answers.push(correct);
    while(answers.length<4){
      let r = data[words[Math.floor(Math.random()*words.length)]].fa;
      if(!answers.includes(r)) answers.push(r);
    }
  }

  /* MODE 2: Definition → Word */
  if(mode===2){
    m.innerText = "Definition → Word";
    q.innerText = w.def;
    speak(w.def);
    correct = currentWord;
    answers.push(correct);
    while(answers.length<4){
      let r = words[Math.floor(Math.random()*words.length)];
      if(!answers.includes(r)) answers.push(r);
    }
  }

  /* MODE 3: Listening → Persian */
  if(mode===3){
    m.innerText = "Listening → Persian";
    q.innerText = "🔊 Listen";
    speak(currentWord);
    correct = w.fa;
    answers.push(correct);
    while(answers.length<4){
      let r = data[words[Math.floor(Math.random()*words.length)]].fa;
      if(!answers.includes(r)) answers.push(r);
    }
  }

  answers.sort(()=>Math.random()-0.5);

  answers.forEach(a=>{
    const b = document.createElement("button");
    b.innerText = a;
    b.onclick = ()=>checkAnswer(b,a,correct);
    document.getElementById("choices").appendChild(b);
  });
}

function checkAnswer(btn,ans,correct){
  if(locked) return;
  locked = true;

  if(ans===correct){
    btn.classList.add("correct");
  }else{
    btn.classList.add("wrong");
    saveWrong();
    [...document.querySelectorAll(".choices button")].forEach(b=>{
      if(b.innerText===correct) b.classList.add("correct");
    });
  }

  setTimeout(nextQuestion,1200);
}

function saveWrong(){
  let l = JSON.parse(localStorage.getItem("leitner")) || {};
  l[currentWord] = {box:1,last:Date.now()};
  localStorage.setItem("leitner",JSON.stringify(l));
    }
