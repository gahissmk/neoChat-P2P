const pc = new RTCPeerConnection();
let channel;

const user = localStorage.getItem("user") || "Anon";

// Remplace par l'URL de ton serveur Replit
const ws = new WebSocket("wss://replit.com/@gahisse822/NeoChat-WS?v=1");

pc.ondatachannel = e => setupChannel(e.channel);

pc.onicecandidate = e => {
  if(e.candidate !== null) return;
  ws.send(JSON.stringify({type:"signal", user, data:pc.localDescription}));
};

function setupChannel(ch){
  channel = ch;
  channel.onmessage = async e => {
    let text = e.data;
    try{text = await decryptMessage(JSON.parse(text));}catch{}
    addMessage(text,"other");
  };
  channel.onopen = () => addMessage("✅ Connexion établie","system");
}

ws.onmessage = async e => {
  const msg = JSON.parse(e.data);
  if(msg.user === user) return;
  if(msg.type==="signal"){
    await pc.setRemoteDescription(msg.data);
    if(msg.data.type==="offer"){
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(JSON.stringify({type:"signal", user, data:answer}));
    }
  }
};

function initConnection(){
  channel = pc.createDataChannel("chat");
  setupChannel(channel);
  pc.createOffer().then(offer => pc.setLocalDescription(offer));
}

function sendChannel(msg){
  if(channel && channel.readyState==="open"){
    channel.send(msg);
  }
}

// Auto-init connection
initConnection();
