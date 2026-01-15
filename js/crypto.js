const enc = new TextEncoder();
const dec = new TextDecoder();
let key;

async function deriveKey(password) {
  const baseKey = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name:"PBKDF2", salt:enc.encode("neochat-salt"), iterations:100000, hash:"SHA-256" },
    baseKey,
    { name:"AES-GCM", length:256 },
    false,
    ["encrypt","decrypt"]
  );
}

async function initCryptoWithRoom(roomCode){ key = await deriveKey(roomCode); }

async function encrypt(text){
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({name:"AES-GCM", iv}, key, enc.encode(text));
  return { iv:[...iv], data:[...new Uint8Array(data)] };
}

async function decrypt(obj){
  const res = await crypto.subtle.decrypt({name:"AES-GCM", iv:new Uint8Array(obj.iv)}, key, new Uint8Array(obj.data));
  return dec.decode(res);
}
