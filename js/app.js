const WS_URL = "wss://6181440f-5ca8-445f-bad1-acad2e5af390-00-2ldq1tnmxdf3h.worf.replit.dev";
const ws = new WebSocket(WS_URL);

const messages = document.getElementById("messages");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");

ws.onopen = () => {
  console.log("✅ Connecté au serveur");
};

ws.onmessage = async (e) => {
  const msg = JSON.parse(e.data);
  const text = await decrypt(msg);
  addMessage(text, "friend");
};

form.addEventListener("submit", async e => {
  e.preventDefault();
  if(!input.value.trim()) return;

  const encrypted = await encrypt(input.value);
  ws.send(JSON.stringify(encrypted));

  addMessage(input.value, "me");
  input.value = "";
});

function addMessage(text, who){
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
