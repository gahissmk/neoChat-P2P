const pc = new RTCPeerConnection();
let channel;

pc.ondatachannel = e => setupChannel(e.channel);

pc.onicecandidate = e => {
  if(e.candidate === null){
    document.getElementById("signal").value = JSON.stringify(pc.localDescription);
  }
};

function setupChannel(ch){
  channel = ch;
  channel.onmessage = async e => {
    let text = e.data;
    try{text = await decryptMessage(JSON.parse(text));}catch{}
    addMessage(text, "other");
  };
  channel.onopen = () => {
    addMessage("✅ Connexion établie", "system");
    notify("Ton ami est connecté !");
  };
}

async function createOffer(){
  channel = pc.createDataChannel("chat");
  setupChannel(channel);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
}

async function connectWithFriend(){
  const sigInput = document.getElementById("signal");
  const sig = sigInput.value.trim();
  if(!sig) return alert("Colle la clé de ton ami !");
  const data = JSON.parse(sig);

  if(data.type === "offer"){
    await pc.setRemoteDescription(data);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    sigInput.value = JSON.stringify(answer);
    alert("✅ Clé envoyée, vous êtes connectés !");
  } else {
    await pc.setRemoteDescription(data);
    alert("✅ Vous êtes maintenant connectés !");
  }
}

function copySignal(){
  const val = document.getElementById("signal").value;
  if(!val) return alert("Crée d'abord ta clé !");
  navigator.clipboard.writeText(val).then(()=>alert("Clé copiée !"));
}
