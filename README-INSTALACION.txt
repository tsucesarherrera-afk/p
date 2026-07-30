# 📱 EPI 13 - Ruta Materna | PWA Instalable

## ¿Qué es esto?
Esta es la versión PWA (Progressive Web App) del sistema EPI 13 - Ruta Materna. 
Permite instalar la aplicación directamente en el celular como si fuera una app nativa, 
sin necesidad de Play Store ni App Store.

---

## 📦 Archivos incluidos

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Aplicación principal (sistema completo) |
| `manifest.json` | Configuración de la app instalable |
| `service-worker.js` | Trabajador en segundo plano (offline + instalación) |
| `icons/` | Iconos de la app en todos los tamaños |

---

## 🚀 Instalación en el servidor

1. Suba **todos los archivos** a su servidor web (debe tener HTTPS).
2. Asegúrese de que los archivos estén en la misma carpeta.
3. Acceda desde el navegador del celular.

> ⚠️ **IMPORTANTE:** La PWA requiere HTTPS para funcionar. Si usa hosting gratuito 
> (Netlify, Vercel, GitHub Pages, Cloudflare Pages), ya viene con HTTPS.

---

## 📲 Instalación en Android (Chrome)

1. Abra Chrome y vaya a la URL del sistema.
2. Espere a que cargue completamente.
3. Toque el **menú de Chrome** (⋮) → **"Agregar a pantalla de inicio"** o **"Instalar app"**.
4. Confirme con **"Instalar"**.
5. ¡Listo! La app aparecerá con su propio icono en el menú de apps.

### Para reinstalar después de desinstalar:
- Mantenga presionado el icono de la app → **"Desinstalar"**.
- Vuelva a abrir Chrome, ingrese a la URL y repita el paso 3.
- No hay límite de reinstalaciones.

---

## 🍎 Instalación en iPhone / iPad (Safari)

1. Abra **Safari** y vaya a la URL del sistema.
2. Toque el botón **Compartir** (cuadrado con flecha hacia arriba).
3. Deslice hacia abajo y toque **"Agregar a Inicio"**.
4. Toque **"Agregar"** en la esquina superior derecha.
5. ¡Listo! El icono aparecerá en la pantalla de inicio.

### Para reinstalar después de desinstalar:
- Mantenga presionado el icono → **"Eliminar app"** → **"Eliminar app"**.
- Vuelva a Safari, ingrese a la URL y repita el paso 2.
- No hay límite de reinstalaciones.

---

## 🔄 Actualización de la app

Cuando suba una nueva versión de `index.html` al servidor:
- **Android:** Cierre la app completamente y vuelva a abrirla. El Service Worker 
  detectará la nueva versión automáticamente.
- **iOS:** Desinstale y vuelva a agregar a inicio, o simplemente recargue Safari 
  y use la app web directamente.

---

## 📋 Requisitos técnicos

- Navegador: Chrome 90+, Safari 14+, Edge 90+, Samsung Internet 15+
- Conexión: Internet para login y datos (el shell funciona offline)
- HTTPS: **Obligatorio** para instalación y Service Worker

---

## 🛠️ Solución de problemas

**"No aparece la opción de instalar"**
→ Asegúrese de usar Chrome (Android) o Safari (iOS). Otros navegadores pueden no soportar PWA.

**"La app no carga después de instalar"**
→ Verifique que tenga conexión a internet. El login requiere conexión a Supabase.

**"Desinstalé y no puedo volver a instalar"**
→ Limpie los datos de navegación del sitio en Chrome/Safari, vuelva a la URL 
  y siga los pasos de instalación. No hay bloqueos de reinstalación.

**"El icono no aparece"**
→ Verifique que la carpeta `icons/` esté junto al `index.html` en el servidor.

---

ASIC Antonio José de Sucre | Camaguán, Guárico, Venezuela
