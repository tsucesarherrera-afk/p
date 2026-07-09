# Mejoras de seguridad implementadas (parciales)

Este commit agrega utilidades y documentación para endurecer la seguridad del frontend sin modificar el index.html directamente (evita romper la aplicación en caliente).

Archivos añadidos:
- web/js/secure-init.js : inicialización segura de Supabase solicitando token de sesión al servidor (/api/session-token). No expone claves en el frontend.
- web/js/backup-crypto.js : funciones basadas en Web Crypto para derivar claves con PBKDF2 y cifrar/descifrar backups con AES-GCM.
- security/SECURITY_IMPROVEMENTS.md : lista de recomendaciones, checklist y pasos concretos para integrar los cambios en producción.

¿Por qué no modifiqué index.html directamente?
- El index.html provisto estaba incompleto/recortado en la entrada que me diste (varios bloques con "[...]"), actualizarlo directamente podría introducir errores o dejar el HTML corrupto.
- Prefiero generar las utilidades y la documentación que puedes integrar de forma segura. Si confirmas que quieres que modifique index.html, lo haré en un PR aplicando las sustituciones concretas (CSP meta, reemplazo de la inicialización de Supabase por initSupabase(), integrar backup-crypto, y remover la llave expuesta).

Instrucciones rápidas para integrar los cambios en index.html:
1) En <head> agrega (preferible en headers HTTP):
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://cdn.tailwindcss.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; connect-src 'self' https://kwvltqnxirdnxoshgcge.supabase.co; img-src 'self' data: https://raw.githubusercontent.com https://github.com; frame-ancestors 'none'; object-src 'none'; form-action 'self';">
   (Recomiendo mover CSP al header del servidor y eliminar 'unsafe-inline' después de refactorizar a scripts externos.)

2) Reemplaza la inicialización actual de Supabase (eliminando la SUPABASE_ANON_KEY embebida) por este include y llamar a initSupabase() desde un script module:
   <script type="module" src="/web/js/secure-init.js"></script>

3) Reemplaza el uso de CryptoJS para backups por las funciones Web Crypto:
   <script type="module" src="/web/js/backup-crypto.js"></script>
   y en tu lógica de backup/restore invoca encryptBackup(...) y decryptBackup(...).

4) Evita innerHTML; usa textContent o createElement() para cualquier dato mostrado desde usuarios.
5) Implementa endpoints server-side:
   - POST /api/session-token -> devuelve { url, anonKey } con permisos mínimos y expiración corta.
   - POST /api/login (rate-limited)
   - POST /api/backup (si deseas que el servidor maneje backups y no el cliente)

---

Commit asociado: "Add secure-init and crypto backup helpers + SECURITY_IMPROVEMENTS.md"
