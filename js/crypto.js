const enc = new TextEncoder();
const dec = new TextDecoder();
let key;

(async()=>{
  key = await crypto.subtle.generateKey({name:"AES-GCM",length:256},true,["encrypt","decrypt"]);
})();

async function encryptMessage(text){
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({name:"AES-GCM",iv},key,enc.encode(text));
  return JSON.stringify({iv:[...iv],data:[...new Uint8Array(data)]});
}

async function decryptMessage(obj){
  if(typeof obj==="string") obj=JSON.parse(obj);
  const res = await crypto.subtle.decrypt({name:"AES-GCM",iv:new Uint8Array(obj.iv)},key,new Uint8Array(obj.data));
  return dec.decode(res);
}
