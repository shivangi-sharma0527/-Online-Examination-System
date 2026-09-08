const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const USERS_KEY = "exampro_users_v1";
const SESSION_KEY = "exampro_session_v1";
const ATTEMPTS_KEY = "exampro_attempts_v1";
const SETTINGS_KEY = "exampro_settings_v1";

const exams = [
  {id:"web",title:"Web Development Fundamentals",category:"Technology",difficulty:"Easy",duration:20,questions:8,icon:"</>",desc:"HTML, CSS, JavaScript and essential web development concepts.",color:"blue",
   qs:[
    ["Which HTML element is used for the largest heading?",["<h6>","<heading>","<h1>","<head>"],2],
    ["Which CSS property changes text color?",["font-style","color","text-color","foreground"],1],
    ["Which keyword declares a block-scoped variable in JavaScript?",["var","let","define","dim"],1],
    ["Which method converts JSON text into a JavaScript object?",["JSON.parse()","JSON.object()","JSON.toObject()","parse.JSON()"],0],
    ["What does CSS stand for?",["Computer Style Sheets","Cascading Style Sheets","Creative Style Syntax","Colorful Style Sheets"],1],
    ["Which symbol starts a JavaScript single-line comment?",["<!--","//","##","**"],1],
    ["Which HTTP method is commonly used to retrieve data?",["POST","PUT","GET","PATCH"],2],
    ["Which array method adds an item to the end?",["push()","pop()","shift()","join()"],0]
   ]},
  {id:"db",title:"Database Management",category:"Computer Science",difficulty:"Medium",duration:25,questions:8,icon:"DB",desc:"SQL, relational databases, keys, normalization and transactions.",color:"purple",
   qs:[
    ["What does SQL stand for?",["Structured Query Language","Simple Question Language","Sequential Query Logic","System Query Link"],0],
    ["Which key uniquely identifies a row?",["Foreign key","Primary key","Candidate value","Index key"],1],
    ["Which SQL command retrieves data?",["SELECT","PULL","FETCHROW","GET"],0],
    ["Which normal form removes repeating groups?",["1NF","2NF","3NF","BCNF"],0],
    ["Which command adds a new row?",["INSERT","ADD","CREATE ROW","APPEND"],0],
    ["A foreign key references what?",["A file","A column in another table","A database server","A query"],1],
    ["Which SQL clause filters rows?",["ORDER BY","GROUP BY","WHERE","HAVING"],2],
    ["What is a transaction property that ensures all-or-nothing execution?",["Atomicity","Isolation","Durability","Indexing"],0]
   ]},
  {id:"python",title:"Python Programming",category:"Programming",difficulty:"Medium",duration:25,questions:8,icon:"Py",desc:"Core Python syntax, functions, collections, exceptions and OOP.",color:"green",
   qs:[
    ["Which keyword defines a function in Python?",["function","def","fun","define"],1],
    ["Which collection is ordered and mutable?",["tuple","set","list","frozenset"],2],
    ["What is len([1,2,3])?",["2","3","4","1"],1],
    ["Which symbol starts a comment?",["//","#","<!--",";"],1],
    ["Which statement handles exceptions?",["try/except","catch/error","handle/exception","if/error"],0],
    ["What is a dictionary key required to be?",["Mutable","Hashable","Numeric","A list"],1],
    ["Which operator performs exponentiation?",["^","**","//","%%"],1],
    ["Which keyword creates a class?",["object","struct","class","typeclass"],2]
   ]},
  {id:"aptitude",title:"General Aptitude",category:"Aptitude",difficulty:"Easy",duration:15,questions:8,icon:"∑",color:"orange",desc:"Numerical reasoning, logic, percentages and basic problem solving.",
   qs:[
    ["If 20% of a number is 40, what is the number?",["100","150","200","250"],2],
    ["What is 15 × 8?",["100","110","120","130"],2],
    ["Find the next number: 2, 4, 8, 16, ?",["20","24","30","32"],3],
    ["A train travels 60 km in 1 hour. What is its speed?",["30 km/h","45 km/h","60 km/h","90 km/h"],2],
    ["What is 3/4 as a percentage?",["25%","50%","75%","80%"],2],
    ["If x + 7 = 15, x equals?",["6","7","8","9"],2],
    ["Which is the odd one out?",["Triangle","Square","Circle","Rectangle"],2],
    ["Average of 10, 20 and 30 is?",["15","20","25","30"],1]
   ]},
  {id:"js",title:"Advanced JavaScript",category:"Technology",difficulty:"Hard",duration:30,questions:8,icon:"JS",color:"red",desc:"Promises, closures, asynchronous code, DOM and modern JavaScript.",
   qs:[
    ["What does a Promise represent?",["A CSS rule","A future async result","A database","A loop"],1],
    ["Which method creates a new array by transforming each element?",["filter()","reduce()","map()","forEach()"],2],
    ["What does === compare?",["Only types","Only values","Value and type","References only"],2],
    ["A closure gives a function access to what?",["Only globals","Its lexical scope","Only DOM","The browser cache"],1],
    ["Which keyword pauses an async function until a Promise settles?",["pause","wait","await","yield"],2],
    ["What is event bubbling?",["Events moving from target toward ancestors","Removing events","Creating timers","Sorting events"],0],
    ["Which API selects the first matching DOM element?",["document.get()","document.querySelector()","document.find()","document.selectOne()"],1],
    ["What is a callback?",["A function passed to another function","A variable","A class","A Promise error"],0]
   ]}
];

const state = { exam:null, answers:[], reviewed:[], index:0, seconds:0, timer:null, startedAt:null };
let currentUser = null;

function getUsers(){ return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
function saveUsers(users){ localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function getAttempts(){ return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "[]"); }
function saveAttempts(a){ localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(a)); }
function getSettings(){ return {...{dark:false,reminders:true,results:true,autosave:true},...JSON.parse(localStorage.getItem(SETTINGS_KEY)||"{}")}; }
function saveSettings(s){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }
function initials(name="Student"){ return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase() || "S"; }
function toast(msg,type="success"){ const el=document.createElement("div"); el.className=`toast ${type}`; el.textContent=msg; $("#toast-container").appendChild(el); setTimeout(()=>el.remove(),2800); }

function seedDemo(){
  const users=getUsers();
  if(!users.some(u=>u.email==="demo@exampro.com")){
    users.push({id:crypto.randomUUID(),name:"Demo Student",username:"demo",email:"demo@exampro.com",password:"123456",phone:"+91 98765 43210",bio:"Ready to learn and improve."});
    saveUsers(users);
  }
}
seedDemo();

function showAuth(mode="login"){
  $("#login-form").classList.toggle("hidden",mode!=="login");
  $("#signup-form").classList.toggle("hidden",mode!=="signup");
  $("#auth-title").textContent=mode==="login"?"Welcome back":"Create your account";
  $("#auth-subtitle").textContent=mode==="login"?"Sign in to continue your examination journey.":"Register once and start taking online examinations.";
}
function openApp(){
  currentUser=getUsers().find(u=>u.id===localStorage.getItem(SESSION_KEY));
  if(!currentUser){ showAuth(); return; }
  $("#auth-screen").classList.add("hidden"); $("#app-screen").classList.remove("hidden");
  renderUser(); renderDashboard(); renderExams(); renderResults(); renderHistory(); renderProfile(); applyTheme();
}
function renderUser(){
  $("#top-name").textContent=currentUser.name; $("#top-avatar").textContent=initials(currentUser.name); $("#welcome-name").textContent=currentUser.name.split(" ")[0];
}
function navigate(view){
  $$(".view").forEach(v=>v.classList.remove("active-view"));
  const target=$("#view-"+view); if(target) target.classList.add("active-view");
  $$(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.view===view));
  $("#breadcrumb").textContent=view[0].toUpperCase()+view.slice(1);
  if(view==="dashboard") renderDashboard();
  if(view==="results") renderResults();
  if(view==="history") renderHistory();
  if(view==="profile") renderProfile();
  if(view==="exams") renderExams();
  $("#sidebar").classList.remove("open");
}
function attempts(){ return getAttempts().filter(a=>a.userId===currentUser.id); }
function renderDashboard(){
  const at=attempts(), scores=at.map(a=>a.score);
  $("#stat-exams").textContent=exams.length; $("#stat-completed").textContent=at.length;
  $("#stat-average").textContent=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)+"%":"0%";
  $("#stat-best").textContent=scores.length?Math.max(...scores)+"%":"0%";
  $("#dashboard-exams").innerHTML=exams.slice(0,3).map(e=>`<div class="exam-mini"><div class="exam-color">${e.icon}</div><div class="exam-mini-main"><strong>${e.title}</strong><span>${e.category} • ${e.duration} min • ${e.questions} questions</span></div><button class="small-action" data-start="${e.id}">Start</button></div>`).join("");
  const recent=at.slice().sort((a,b)=>b.date-a.date).slice(0,4);
  $("#dashboard-results").innerHTML=recent.length?recent.map(a=>`<div class="result-row"><div><strong>${a.examTitle}</strong><span>${formatDate(a.date)}</span></div><div class="score">${a.score}%</div></div>`).join(""):`<div class="empty-state">No attempts yet. Start your first exam!</div>`;
}
function renderExams(){
  const q=($("#exam-search")?.value||"").toLowerCase(), cat=$("#category-filter")?.value||"all", diff=$("#difficulty-filter")?.value||"all";
  const cats=[...new Set(exams.map(e=>e.category))]; $("#category-filter").innerHTML=`<option value="all">All categories</option>`+cats.map(c=>`<option ${c===cat?"selected":""}>${c}</option>`).join("");
  $("#difficulty-filter").value=diff;
  const filtered=exams.filter(e=>(e.title+" "+e.category+" "+e.desc).toLowerCase().includes(q)&&(cat==="all"||e.category===cat)&&(diff==="all"||e.difficulty===diff));
  $("#exam-grid").innerHTML=filtered.length?filtered.map(e=>`<article class="exam-card">
    <div class="exam-top"><div class="exam-icon">${e.icon}</div><span class="difficulty ${e.difficulty}">${e.difficulty}</span></div>
    <h3>${e.title}</h3><p>${e.desc}</p>
    <div class="exam-meta"><span>◷ ${e.duration} min</span><span>▤ ${e.questions} Questions</span><span>✓ MCQ</span></div>
    <div class="exam-card-actions"><button class="secondary-btn" data-details="${e.id}">Details</button><button class="primary-btn" data-start="${e.id}">Start Exam</button></div>
  </article>`).join(""):`<div class="panel" style="grid-column:1/-1;text-align:center">No exams match your search.</div>`;
}
function renderResults(){
  const at=attempts().sort((a,b)=>b.date-a.date), scores=at.map(a=>a.score), avg=scores.length?Math.round(scores.reduce((x,y)=>x+y,0)/scores.length):0,best=scores.length?Math.max(...scores):0;
  $("#result-average").textContent=avg+"%"; $("#result-attempts").textContent=at.length; $("#result-passed").textContent=at.filter(a=>a.score>=50).length; $("#result-best").textContent=best+"%";
  $("#results-table").innerHTML=at.length?at.map(a=>`<tr><td><strong>${a.examTitle}</strong></td><td>${formatDate(a.date)}</td><td><strong>${a.score}%</strong></td><td><span class="status ${a.score>=50?"pass":"fail"}">${a.score>=50?"Passed":"Needs practice"}</span></td><td><button class="text-btn" data-result="${a.id}">Review</button></td></tr>`).join(""):`<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:30px">No results available yet.</td></tr>`;
}
function renderHistory(){
  const at=attempts().sort((a,b)=>b.date-a.date);
  $("#history-list").innerHTML=at.length?at.map(a=>`<div class="history-item"><div class="history-icon">✓</div><div class="history-main"><strong>${a.examTitle}</strong><span>${formatDate(a.date)} • ${a.correct} correct • ${a.total} questions</span></div><div class="history-score">${a.score}%</div></div>`).join(""):`<div class="panel" style="text-align:center;color:var(--muted)">Your completed exams will appear here.</div>`;
}
function renderProfile(){
  $("#profile-name").value=currentUser.name||""; $("#profile-username").value=currentUser.username||""; $("#profile-email").value=currentUser.email||"";
  $("#profile-phone").value=currentUser.phone||""; $("#profile-bio").value=currentUser.bio||"";
  $("#profile-avatar").textContent=initials(currentUser.name); $("#profile-name-card").textContent=currentUser.name; $("#profile-email-card").textContent=currentUser.email;
}
function formatDate(ts){return new Date(ts).toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"});}
function openDetails(id){
  const e=exams.find(x=>x.id===id); if(!e)return;
  $("#details-content").innerHTML=`<span class="eyebrow">${e.category.toUpperCase()}</span><h2 class="details-title">${e.title}</h2><p class="details-desc">${e.desc}</p>
  <div class="details-info"><div><span>QUESTIONS</span><strong>${e.questions}</strong></div><div><span>DURATION</span><strong>${e.duration} min</strong></div><div><span>LEVEL</span><strong>${e.difficulty}</strong></div></div>
  <h3>Instructions</h3><ul class="details-desc"><li>Each question has one correct answer.</li><li>You can move between questions using the palette.</li><li>Questions can be marked for review.</li><li>Your result is calculated immediately after submission.</li></ul>
  <button class="primary-btn full" data-start="${e.id}">Start this exam</button>`;
  $("#details-modal").classList.remove("hidden");
}
function startExam(id){
  const e=exams.find(x=>x.id===id); if(!e)return;
  $("#details-modal").classList.add("hidden");
  state.exam=e; state.answers=Array(e.questions).fill(null); state.reviewed=Array(e.questions).fill(false); state.index=0; state.seconds=e.duration*60; state.startedAt=Date.now();
  $("#player-title").textContent=e.title; $("#player-meta").textContent=`${e.questions} Questions • ${e.duration} minutes`; $("#exam-modal").classList.remove("hidden");
  renderQuestion(); clearInterval(state.timer); state.timer=setInterval(()=>{state.seconds--; updateTimer(); if(state.seconds<=0) finishExam(true);},1000); updateTimer();
}
function updateTimer(){const m=Math.floor(state.seconds/60),s=state.seconds%60,el=$("#exam-timer");el.textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;el.classList.toggle("warning",state.seconds<=300&&state.seconds>60);el.classList.toggle("danger",state.seconds<=60);}
function renderQuestion(){
  const q=state.exam.qs[state.index], selected=state.answers[state.index];
  $("#question-count").textContent=`Question ${state.index+1} of ${state.exam.questions}`; $("#question-progress").style.width=((state.index+1)/state.exam.questions*100)+"%"; $("#question-text").textContent=q[0];
  $("#options").innerHTML=q[1].map((op,i)=>`<label class="option ${selected===i?"selected":""}"><input type="radio" name="answer" value="${i}" ${selected===i?"checked":""}><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${op}</span></label>`).join("");
  $("#prev-question").disabled=state.index===0; $("#next-question").classList.toggle("hidden",state.index===state.exam.questions-1); $("#submit-exam").classList.toggle("hidden",state.index!==state.exam.questions-1);
  $("#mark-review").classList.toggle("marked",state.reviewed[state.index]); $("#mark-review").textContent=state.reviewed[state.index]?"★ Marked for review":"☆ Mark for review";
  $("#palette").innerHTML=state.exam.qs.map((_,i)=>`<button class="${i===state.index?"current ":""}${state.answers[i]!==null?"answered ":""}${state.reviewed[i]?"review":""}" data-jump="${i}">${i+1}</button>`).join("");
}
function finishExam(auto=false){
  clearInterval(state.timer); state.timer=null;
  const e=state.exam; let correct=0,unanswered=0;
  state.answers.forEach((a,i)=>{if(a===null)unanswered++; else if(a===e.qs[i][2])correct++;});
  const wrong=e.questions-correct-unanswered,score=Math.round(correct/e.questions*100);
  const attempt={id:crypto.randomUUID(),userId:currentUser.id,examId:e.id,examTitle:e.title,date:Date.now(),score,correct,wrong,unanswered,total:e.questions,timeUsed:Math.max(0,Math.round((e.duration*60-state.seconds)/60))};
  const all=getAttempts(); all.push(attempt); saveAttempts(all);
  $("#exam-modal").classList.add("hidden"); $("#result-modal").classList.remove("hidden");
  $("#result-circle").textContent=score+"%"; $("#result-title").textContent=score>=50?"Great work!":"Keep practicing!";
  $("#result-message").textContent=auto?"Time is up. Your exam was submitted automatically.":score>=50?"You passed this examination. Review your result to see your performance.":"You can retake the exam and improve your score.";
  $("#final-correct").textContent=correct;$("#final-wrong").textContent=wrong;$("#final-unanswered").textContent=unanswered;$("#final-time").textContent=attempt.timeUsed+" min";
}
function applyTheme(){const s=getSettings();document.body.classList.toggle("dark",s.dark);$("#settings-theme").checked=s.dark;$("#theme-toggle").textContent=s.dark?"☾":"☼";}

document.addEventListener("click",e=>{
  const v=e.target.closest("[data-view]"); if(v&&!v.dataset.start){navigate(v.dataset.view);return;}
  const start=e.target.closest("[data-start]"); if(start){startExam(start.dataset.start);return;}
  const det=e.target.closest("[data-details]"); if(det){openDetails(det.dataset.details);return;}
  const jump=e.target.closest("[data-jump]"); if(jump){state.index=+jump.dataset.jump;renderQuestion();return;}
  if(e.target.matches("[data-close]")){$("#"+e.target.dataset.close).classList.add("hidden");}
});
$("#show-signup").onclick=()=>showAuth("signup"); $("#show-login").onclick=()=>showAuth("login");
$$(".toggle-password").forEach(b=>b.onclick=()=>{const i=$("#"+b.dataset.target);i.type=i.type==="password"?"text":"password";});
$("#login-form").onsubmit=e=>{e.preventDefault();const email=$("#login-email").value.trim().toLowerCase(),pw=$("#login-password").value;const u=getUsers().find(x=>x.email.toLowerCase()===email&&x.password===pw);if(!u){toast("Invalid email or password.","error");return}localStorage.setItem(SESSION_KEY,u.id);openApp();toast("Welcome back, "+u.name.split(" ")[0]+"!");};
$("#signup-form").onsubmit=e=>{e.preventDefault();const name=$("#signup-name").value.trim(),username=$("#signup-username").value.trim(),email=$("#signup-email").value.trim().toLowerCase(),pw=$("#signup-password").value,confirm=$("#signup-confirm").value;if(pw!==confirm){toast("Passwords do not match.","error");return}const users=getUsers();if(users.some(u=>u.email.toLowerCase()===email)){toast("An account with this email already exists.","error");return}if(users.some(u=>u.username.toLowerCase()===username.toLowerCase())){toast("Username is already taken.","error");return}const u={id:crypto.randomUUID(),name,username,email,password:pw,phone:"",bio:""};users.push(u);saveUsers(users);localStorage.setItem(SESSION_KEY,u.id);openApp();toast("Account created successfully!");};
$("#forgot-btn").onclick=()=>{const email=prompt("Enter your registered email address:");if(!email)return;const u=getUsers().find(x=>x.email.toLowerCase()===email.trim().toLowerCase());toast(u?"Demo reset: your password is the one you registered with.":"No account found for that email.",u?"success":"error");};
$("#logout-btn").onclick=()=>{localStorage.removeItem(SESSION_KEY);currentUser=null;$("#app-screen").classList.add("hidden");$("#auth-screen").classList.remove("hidden");showAuth("login");toast("You have been logged out.");};
$("#mobile-menu").onclick=()=>$("#sidebar").classList.toggle("open");
$("#exam-search").oninput=renderExams;$("#category-filter").onchange=renderExams;$("#difficulty-filter").onchange=renderExams;
$("#profile-form").onsubmit=e=>{e.preventDefault();const users=getUsers(),u=users.find(x=>x.id===currentUser.id);u.name=$("#profile-name").value.trim();u.username=$("#profile-username").value.trim();u.email=$("#profile-email").value.trim();u.phone=$("#profile-phone").value.trim();u.bio=$("#profile-bio").value.trim();saveUsers(users);currentUser=u;renderUser();renderProfile();toast("Profile updated.");};
$("#theme-toggle").onclick=()=>{const s=getSettings();s.dark=!s.dark;saveSettings(s);applyTheme();};
$("#settings-theme").onchange=()=>{const s=getSettings();s.dark=$("#settings-theme").checked;saveSettings(s);applyTheme();};
$("#setting-reminders").onchange=e=>{const s=getSettings();s.reminders=e.target.checked;saveSettings(s);};
$("#setting-results").onchange=e=>{const s=getSettings();s.results=e.target.checked;saveSettings(s);};
$("#setting-autosave").onchange=e=>{const s=getSettings();s.autosave=e.target.checked;saveSettings(s);};
$("#clear-data-btn").onclick=()=>{if(confirm("Clear all your exam attempts? This cannot be undone.")){saveAttempts(getAttempts().filter(a=>a.userId!==currentUser.id));renderDashboard();renderResults();renderHistory();toast("Your attempts were cleared.");}};
$("#exit-exam").onclick=()=>{if(confirm("Exit this exam? Your current attempt will be lost.")){clearInterval(state.timer);$("#exam-modal").classList.add("hidden");}};
$("#prev-question").onclick=()=>{if(state.index>0){state.index--;renderQuestion();}};
$("#next-question").onclick=()=>{if(state.answers[state.index]===null)toast("Please select an answer before continuing.","error");else{state.index++;renderQuestion();}};
$("#submit-exam").onclick=()=>{const unanswered=state.answers.filter(a=>a===null).length;if(unanswered&& !confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`))return;finishExam(false);};
$("#mark-review").onclick=()=>{state.reviewed[state.index]=!state.reviewed[state.index];renderQuestion();};
$("#options").addEventListener("change",e=>{if(e.target.name==="answer"){state.answers[state.index]=+e.target.value;renderQuestion();}});
$("#close-result").onclick=()=>{$("#result-modal").classList.add("hidden");navigate("dashboard");};
$("#review-result").onclick=()=>{$("#result-modal").classList.add("hidden");navigate("results");};
$("#notification-btn").onclick=()=>toast("You're all caught up!");
document.addEventListener("keydown",e=>{if($("#exam-modal").classList.contains("hidden"))return;if(e.key==="ArrowRight"&&!$("#next-question").classList.contains("hidden"))$("#next-question").click();if(e.key==="ArrowLeft")$("#prev-question").click();});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&state.exam&&state.timer)updateTimer();});

const session=localStorage.getItem(SESSION_KEY); if(session){openApp();}else{showAuth("login");}
