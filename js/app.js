const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");

if(!localStorage.getItem("user")) location.href="login.html";

function addMessage(text,type){
  const div = document.createElement("div");
  div.className = "msg "+type;
  div.innerHTML = `<b>${type==="me"?localStorage.getItem("user"):"Ami"}:</b> ${text}`;
  messages.appendChild(div);
  div.animate([{opacity:0, transform:"translateY(20px)"},{opacity:1, transform:"translateY(0)"}],{duration:300});
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage(e){
  e.preventDefault();
  if(!messageInput.value) return;
  const encrypted = await encryptMessage(messageInput.value);
  sendChannel(encrypted);
  addMessage(messageInput.value,"me");
  messageInput.value="";
}

function logout(){
  localStorage.clear();
  location.href="login.html";
}
