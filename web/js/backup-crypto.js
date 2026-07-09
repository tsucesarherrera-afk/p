// backup-crypto.js
// Utilities using Web Crypto API for client-side backup encryption.
// Usage:
//  const b64 = await encryptBackup(yourObject, password);
//  const obj = await decryptBackup(b64, password);

function toUint8Array(buf) {
  return buf instanceof Uint8Array ? buf : new Uint8Array(buf);
}

async function deriveKey(password, salt, iterations = 200000) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']);
  return await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt, iterations: iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptBackup(plainObj, password) {
  if (!password || password.length < 8) throw new Error('Password debe tener al menos 8 caracteres');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const encoded = new TextEncoder().encode(JSON.stringify(plainObj));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  // empaqueta: salt | iv | ciphertext
  const combined = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.byteLength);
  combined.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);
  // convierte a base64
  let binary = '';
  const len = combined.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(combined[i]);
  return btoa(binary);
}

export async function decryptBackup(b64Combined, password) {
  if (!password || password.length < 8) throw new Error('Password debe tener al menos 8 caracteres');
  const binary = atob(b64Combined);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const salt = bytes.slice(0, 16);
  const iv = bytes.slice(16, 28);
  const ciphertext = bytes.slice(28);
  const key = await deriveKey(password, salt);
  try {
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    const decoded = new TextDecoder().decode(plainBuf);
    return JSON.parse(decoded);
  } catch (err) {
    // Si falla la desencriptación, lanzamos un error claro
    throw new Error('Fallo al desencriptar: clave incorrecta o archivo corrupto');
  }
}

// export para uso en el cliente
export default { encryptBackup, decryptBackup };
