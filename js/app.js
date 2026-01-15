(async () => {

  // URL de ton serveur WebSocket (doit être en ligne)
  const WS_URL = "wss://6181440f-5ca8-445f-bad1-acad2e5af390-00-2ldq1tnmxdf3h.worf.replit.dev";
  const ws = new WebSocket(WS_URL);

  const messages = document.getElementById("messages");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("messageInput");

  const myId = crypto.randomUUID();

  // PSEUDO FIXE depuis login/register
  const username = localStorage.getItem('neochat_user') || prompt("Ton pseudo :") || "Anonyme";

  // SALON choisi
  const roomCode = localStorage.getItem("neochat_room") || "default";
  document.getElementById("currentRoom").textContent = roomCode;

  // Init crypto avec le code du salon
  await initCryptoWithRoom(roomCode);

  // Historique
  const historyKey = "neochat_history_" + roomCode;
  const oldMessages = JSON.parse(localStorage.getItem(historyKey) || "[]");
  oldMessages.forEach(m => addMessage(m.text, m.who, m.user, m.time, false));

  ws.onopen = () => console.log("✅ WebSocket connecté");

  ws.onmessage = async event => {
    let data = event.data;
    if (data instanceof Blob) data = await data.text();

    let msg;
    try { msg = JSON.parse(data); } catch { return; }

    if(msg.sender === myId) return; // Ignore ses propres messages

    try {
      const text = await decrypt(msg.payload);
      addMessage(text, "friend", msg.user, msg.time, true);
    } catch { console.warn("Message non déchiffrable"); }
  };

  // Envoyer un message
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if(!input.value.trim()) return;

    const encrypted = await encrypt(input.value);

    const message = {
      sender: myId,
      user: username,
      time: Date.now(),
      payload: encrypted,
      room: roomCode
    };

    if(ws.readyState === WebSocket.OPEN){
      ws.send(JSON.stringify(message));
      addMessage(input.value, "me", username, message.time, true);
      input.value = "";
    } else {
      alert("WebSocket non connecté, impossible d'envoyer le message");
    }
  });

  function addMessage(text, who, user, time, save){
    const div = document.createElement("div");
    div.className="msg "+who;

    const content = document.createElement("div");
    content.textContent=text;

    const meta = document.createElement("div");
    meta.className="meta";
    meta.textContent=`${user} • ${new Date(time).toLocaleTimeString()}`;

    div.appendChild(content);
    div.appendChild(meta);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;

    if(save){
      const history = JSON.parse(localStorage.getItem(historyKey)||"[]");
      history.push({text,who,user,time});
      localStorage.setItem(historyKey, JSON.stringify(history));
    }
  }

})();
