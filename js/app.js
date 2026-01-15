// ---------------------------
// NeoChat WAW++ – app.js
// ---------------------------

// Assure que ce script est chargé comme module
// <script type="module" src="js/app.js"></script>

// Variables globales
const username = localStorage.getItem("neochat_session");
if(!username) location.href = "login.html";

const room = localStorage.getItem("neochat_room") || "public";

const currentUser = document.getElementById("currentUser");
currentUser.textContent = username;

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const chatForm = document.getElementById("chatForm");
const typingStatus = document.getElementById("typingStatus");

// ---------------------------
// WebSocket
// ---------------------------
// Remplace par ton URL publique WebSocket
const ws = new WebSocket("wss://6181440f-5ca8-445f-bad1-acad2e5af390-00-2ldq1tnmxdf3h.worf.replit.dev");

ws.onopen = () => console.log("✅ WebSocket connecté");
ws.onerror = e => console.log("❌ WebSocket erreur :", e);

// ---------------------------
// Son notification + vibration
// ---------------------------
const notifSound = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=");
notifSound.volume = 0.2;

function notifyUser(){
  notifSound.play().catch(()=>{});
  if("vibrate" in navigator) navigator.vibrate(150);
}

// ---------------------------
// Messages éphémères
// ---------------------------
function autoDeleteMessage(row, seconds=10){
  setTimeout(() => {
    if(row.parentNode){
      row.style.transition = "opacity 0.5s ease";
      row.style.opacity = "0";
      setTimeout(()=> row.remove(), 500);
    }
  }, seconds * 1000);
}

// ---------------------------
// Ajout réactions
// ---------------------------
function addReactions(row, messageId){
  const reactionsDiv = document.createElement("div");
  reactionsDiv.className = "reactions";

  ["❤️","😂","🔥"].forEach(emoji=>{
    const btn = document.createElement("span");
    btn.className = "reaction";
    btn.textContent = emoji;

    btn.onclick = () => {
      if(ws.readyState === WebSocket.OPEN){
        ws.send(JSON.stringify({
          type: "reaction",
          user: username,
          emoji,
          messageId,
          room
        }));
      }
    }

    reactionsDiv.appendChild(btn);
  });

  row.querySelector(".message-content").appendChild(reactionsDiv);
}

// ---------------------------
// Envoi message
// ---------------------------
chatForm.onsubmit = async e => {
  e.preventDefault();
  if(!messageInput.value) return;

  try {
    const encMsg = await encrypt(messageInput.value);
    const msgId = Date.now();

    if(ws.readyState === WebSocket.OPEN){
      ws.send(JSON.stringify({
        type: "msg",
        user: username,
        room,
        messageId: msgId,
        data: encMsg
      }));
      messageInput.value = "";
    } else {
      console.log("WebSocket pas encore prête !");
      alert("Connexion pas encore prête, réessaie");
    }
  } catch(err){
    console.log("Erreur encrypt :", err);
  }
};

// ---------------------------
// Typing indicator
// ---------------------------
messageInput.oninput = () => {
  if(ws.readyState === WebSocket.OPEN){
    ws.send(JSON.stringify({ type: "typing", user: username, room }));
  }
};

// ---------------------------
// Réception messages
// ---------------------------
ws.onmessage = async e => {
  let data;
  try { 
    data = JSON.parse(e.data); 
  } catch(err){ 
    console.log("Erreur JSON.parse :", err, e.data);
    return; 
  }

  if(data.room !== room) return;

  // Typing
  if(data.type === "typing"){
    typingStatus.textContent = data.user + " écrit...";
    setTimeout(()=> typingStatus.textContent = "", 1500);
    return;
  }

  // Message normal
  if(data.type === "msg"){
    let text;
    try {
      text = await decrypt(data.data);
    } catch(err){
      console.log("Erreur decrypt :", err, data.data);
      text = "[Erreur de décrypt]";
    }

    const row = document.createElement("div");
    row.className = "message-row" + (data.user===username?" me":"");
    row.dataset.id = data.messageId;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = data.user.charAt(0).toUpperCase();

    const content = document.createElement("div");
    content.className = "message-content";

    const userEl = document.createElement("div");
    userEl.className = "message-user";
    userEl.textContent = data.user;

    const bubble = document.createElement("div");
    bubble.className = "message" + (data.user===username?" me":"");
    bubble.textContent = text;

    content.appendChild(userEl);
    content.appendChild(bubble);

    row.appendChild(avatar);
    row.appendChild(content);

    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;

    addReactions(row, data.messageId);
    autoDeleteMessage(row, 10);

    if(data.user !== username) notifyUser();
  }

  // Réaction
  if(data.type === "reaction"){
    const row = document.querySelector(`[data-id='${data.messageId}']`);
    if(!row) return;

    let existing = row.querySelector(".reactions span[data-user='"+data.user+"']");
    if(!existing){
      const span = document.createElement("span");
      span.textContent = data.emoji;
      span.dataset.user = data.user;
      span.className = "reaction";
      row.querySelector(".reactions").appendChild(span);
    }
    notifyUser();
  }
};

// ---------------------------
// Logout
// ---------------------------
function logout(){
  localStorage.removeItem("neochat_session");
  localStorage.removeItem("neochat_room");
  location.href = "login.html";
}
