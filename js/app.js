(async () => {

  /************* CONFIGURATION WS *************/
  const WS_URL = "wss://6181440f-5ca8-445f-bad1-acad2e5af390-00-2ldq1tnmxdf3h.worf.replit.dev"; // <--- Mets ton WebSocket ici
  const ws = new WebSocket(WS_URL);

  /************* DOM *************/
  const messages = document.getElementById("messages");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("messageInput");
  const imageInput = document.getElementById("imageInput");
  const emojiPicker = document.getElementById("emojiPicker");
  const onlineList = document.getElementById("onlineUsers");
  const roomList = document.getElementById("roomList");
  const currentRoom = localStorage.getItem("neochat_room") || "Salon";
  document.getElementById("currentRoom").textContent = currentRoom;

  /************* UTILISATEUR *************/
  const myId = crypto.randomUUID();
  const username = localStorage.getItem('neochat_user') || "Anonyme";

  /************* CRYPTO *************/
  await initCryptoWithRoom(currentRoom);

  /************* HISTORIQUE *************/
  const historyKey = "neochat_history_" + currentRoom;
  const oldMessages = JSON.parse(localStorage.getItem(historyKey) || "[]");
  oldMessages.forEach(m => addMessage(m.text, m.type, m.user, m.time, false));

  /************* UTILISATEURS & SALONS *************/
  const onlineUsers = new Map(); // user => avatar
  const salons = new Set([currentRoom]); // salon actuel

  function updateOnlineSidebar(){
    onlineList.innerHTML = "";
    onlineUsers.forEach((avatar,user)=>{
      const li = document.createElement("li");
      li.textContent = `${avatar} ${user}`;
      onlineList.appendChild(li);
    });
  }

  function updateRoomList(){
    roomList.innerHTML = "";
    salons.forEach(salon=>{
      const li = document.createElement("li");
      li.textContent = salon;
      li.onclick = () => {
        localStorage.setItem("neochat_room", salon);
        location.reload();
      };
      roomList.appendChild(li);
    });
  }

  /************* WS EVENTS *************/
  ws.onopen = () => {
    console.log("✅ WebSocket connecté");
    ws.send(JSON.stringify({ type:"presence", user:username, avatar:generateAvatar(username), online:true, room:currentRoom }));
  };

  ws.onmessage = async event => {
    let data = event.data;
    if (data instanceof Blob) data = await data.text();
    let msg;
    try { msg = JSON.parse(data); } catch { return; }

    // Messages présence
    if(msg.type === "presence"){
      if(msg.online){
        onlineUsers.set(msg.user, msg.avatar);
        salons.add(msg.room);
      } else {
        onlineUsers.delete(msg.user);
      }
      updateOnlineSidebar();
      updateRoomList();
      return;
    }

    // Messages classiques
    if(msg.sender === myId) return;
    try {
      const text = await decrypt(msg.payload);
      if(msg.msgType === "image") addImageMessage(text,"friend",msg.user,msg.time,true);
      else addMessage(text,"friend",msg.user,msg.time,true);
      playNotification();
    } catch { console.warn("Message non déchiffrable"); }
  };

  /************* ENVOI MESSAGE *************/
  form.addEventListener("submit", async e=>{
    e.preventDefault();
    if(!input.value.trim()) return;
    sendMessage(input.value,"text");
    input.value="";
  });

  imageInput.addEventListener("change", async e=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await sendMessage(reader.result,"image");
      imageInput.value="";
    };
    reader.readAsDataURL(file);
  });

  async function sendMessage(text,type){
    const encrypted = await encrypt(text);
    const message = {
      sender: myId,
      user: username,
      time: Date.now(),
      payload: encrypted,
      msgType:type,
      room:currentRoom,
      type:"message"
    };
    if(ws.readyState === WebSocket.OPEN){
      ws.send(JSON.stringify(message));
      if(type==="image") addImageMessage(text,"me",username,message.time,true);
      else addMessage(text,"me",username,message.time,true);
    }
  }

  /************* AJOUTER MESSAGE AU DOM *************/
  function addMessage(text,who,user,time,save){
    const div = document.createElement("div");
    div.className="msg "+who;
    const content = document.createElement("div");
    content.textContent = text;
    const meta = document.createElement("div");
    meta.className="meta";
    meta.textContent=`${user} • ${new Date(time).toLocaleTimeString()}`;
    div.appendChild(content);
    div.appendChild(meta);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    if(save){
      const history = JSON.parse(localStorage.getItem(historyKey)||"[]");
      history.push({text, type:who==="me"?"text":"friend", user, time});
      localStorage.setItem(historyKey,JSON.stringify(history));
    }
  }

  function addImageMessage(src,who,user,time){
    const div = document.createElement("div");
    div.className="msg "+who;
    const img = document.createElement("img");
    img.src = src;
    img.style.maxWidth="200px";
    img.style.borderRadius="12px";
    const meta = document.createElement("div");
    meta.className="meta";
    meta.textContent=`${user} • ${new Date(time).toLocaleTimeString()}`;
    div.appendChild(img);
    div.appendChild(meta);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    const history = JSON.parse(localStorage.getItem(historyKey)||"[]");
    history.push({text:src,type:"image",user,time});
    localStorage.setItem(historyKey,JSON.stringify(history));
  }

  /************* NOTIFICATIONS *************/
  function playNotification(){
    const audio = new Audio("https://www.soundjay.com/button/beep-07.wav");
    audio.play();
  }

  /************* AVATAR *************/
  function generateAvatar(name){
    const colors = ["😀","😎","💡","🎉","😂","😍","👍","😢"];
    let hash = 0;
    for(let i=0;i<name.length;i++) hash+=name.charCodeAt(i);
    return colors[hash%colors.length];
  }

})();
