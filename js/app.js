(async () => {

  const WS_URL = "wss://6181440f-5ca8-445f-bad1-acad2e5af390-00-2ldq1tnmxdf3h.worf.replit.dev";
  const ws = new WebSocket(WS_URL);

  const messages = document.getElementById("messages");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("messageInput");

  // identifiant unique
  const myId = crypto.randomUUID();

  // code salon (identique pour ton ami)
  const roomCode = prompt("Code du salon (le même pour tous) :");
  await initCryptoWithRoom(roomCode);

  ws.onopen = () => {
    console.log("✅ WebSocket connecté");
  };

  ws.onmessage = async (event) => {
    let data = event.data;
    if (data instanceof Blob) data = await data.text();

    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }

    // ignorer ses propres messages
    if (msg.sender === myId) return;

    try {
      const text = await decrypt(msg.payload);
      addMessage(text, "friend");
    } catch {
      console.warn("Impossible de déchiffrer le message");
    }
  };

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!input.value.trim()) return;

    const encrypted = await encrypt(input.value);

    const message = {
      sender: myId,
      payload: encrypted
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      addMessage(input.value, "me");
      input.value = "";
    }
  });

  function addMessage(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + who;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

})();
