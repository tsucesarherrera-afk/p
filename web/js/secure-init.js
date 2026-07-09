// secure-init.js
// Instrucciones:
// - Incluir en index.html con: <script type="module" src="/web/js/secure-init.js"></script>
// - El servidor debe exponer /api/session-token que retorne JSON: { url: string, anonKey: string }
// - El servidor debe controlar CORS, rate-limit y emitir claves con permisos mínimos.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/esm/index.js';

export let supabaseClient = null;

export async function initSupabase() {
  try {
    // Solicita un token de sesión al servidor (no expongas la service_role ni claves con privilegios)
    const res = await fetch('/api/session-token', { credentials: 'include' });
    if (!res.ok) {
      console.warn('[secure-init] No se pudo obtener token desde /api/session-token. Modo demo sin conexión a Supabase.');
      return null;
    }
    const data = await res.json();
    if (!data || !data.url || !data.anonKey) {
      console.error('[secure-init] Respuesta inválida de /api/session-token');
      return null;
    }
    // Inicializa supabase con el token mínimo proporcionado por el servidor
    supabaseClient = createClient(data.url, data.anonKey);
    console.log('[secure-init] Supabase inicializado (token temporal).');
    return supabaseClient;
  } catch (err) {
    console.error('[secure-init] Error inicializando Supabase:', err);
    return null;
  }
}

// Auto-init: llamar desde index.html si deseas
// initSupabase();
