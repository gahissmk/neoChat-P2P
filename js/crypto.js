const enc = new TextEncoder();
const dec = new TextDecoder();
let key;

async function initCrypto(){
  key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encrypt(text){
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );
  return { iv: [...iv], data: [...new Uint8Array(data)] };
}

async function decrypt(obj){
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(obj.iv) },
    key,
    new Uint8Array(obj.data)
  );
  return dec.decode(decrypted);
}

initCrypto();
