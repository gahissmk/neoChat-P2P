const pc = new RTCPeerConnection();
let channel;

pc.ondatachannel = e => setupChannel(e.channel);

pc.onicecandidate = e => {
  if(e.candidate === null){
    signal.value = JSON.stringify(pc.localDescription);
  }
};

function setupChannel(ch){
  channel = ch;
  channel.onmessage = e => addMessage(e.data, "other");
}

async function createOffer(){
  channel = pc.createDataChannel("chat");
  setupChannel(channel);

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
}

async function useSignal(){
  const data = JSON.parse(signal.value);

  if(data.type === "offer"){
    await pc.setRemoteDescription(data);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    signal.value = JSON.stringify(answer);
  } else {
    await pc.setRemoteDescription(data);
  }
}
