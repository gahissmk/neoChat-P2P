const user = localStorage.getItem("user");
if(!user) location.href = "login.html";

const messages = document.getElementById("messages");

function addMessage(text, type){
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerHTML = `<b>${type === "me" ? user : "Ami"}:</b> ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function sendMessage(e){
  e.preventDefault();
  if(!messageInput.value || !channel) return;

  channel.send(messageInput.value);
  addMessage(messageInput.value, "me");
  messageInput.value = "";
}

function logout(){
  localStorage.clear();
  location.href = "login.html";
}
