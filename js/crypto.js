const enc=new TextEncoder(),dec=new TextDecoder();
let aesKey;

async function initCrypto(){
  aesKey=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']);
}

async function encrypt(text){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},aesKey,enc.encode(text));
  return {iv:[...iv],data:[...new Uint8Array(data)]};
}

async function decrypt(obj){
  const res=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(obj.iv)},aesKey,new Uint8Array(obj.data));
  return dec.decode(res);
}

initCrypto();
