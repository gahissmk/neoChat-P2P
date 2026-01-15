const user = localStorage.getItem("user");
if(!user) location.href = "login.html";

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");

function addMessage(text, type){
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerHTML = `<b>${type==="me"?user:type==="system"?"": "Ami"}:</b> ${text}`;
  messages.appendChild(div);
  div.animate([{opacity:0, transform:"translateY(20px)"},{opacity:1, transform:"translateY(0)"}], {duration:300});
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage(e){
  e.preventDefault();
  if(!messageInput.value || !channel) return;
  const encrypted = await encryptMessage(messageInput.value);
  channel.send(encrypted);
  addMessage(messageInput.value, "me");
  messageInput.value = "";
}

function logout(){
  localStorage.clear();
  location.href = "login.html";
}

// Notifications
if(Notification.permission !== "granted"){
  Notification.requestPermission();
}

function notify(msg){
  if(Notification.permission === "granted"){
    new Notification(msg);
  }
}
