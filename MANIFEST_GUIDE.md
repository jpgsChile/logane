# 📋 Guía de Configuración del Manifiesto - Lo Gane

## 🎯 **Resumen de Configuración**

Tu MiniApp "Lo Gane" está configurada con todos los archivos de manifiesto necesarios para funcionar correctamente en Farcaster y como PWA.

## 📁 **Archivos de Configuración Creados**

### 1. **`/public/manifest.json`** - Manifiesto Principal PWA
```json
{
  "name": "Lo Gane - Rifas Descentralizadas",
  "short_name": "Lo Gane",
  "background_color": "#667eea",
  "theme_color": "#764ba2",
  "display": "standalone",
  "start_url": "/lo-gane"
}
```

### 2. **`/public/farcaster-splash.json`** - Configuración Farcaster
```json
{
  "splash": {
    "background_color": "#667eea",
    "theme_color": "#764ba2",
    "image": "/api/og",
    "title": "Lo Gane",
    "subtitle": "Rifas Descentralizadas"
  }
}
```

### 3. **Iconos Generados** (SVG)
- `icon-192.svg` - Icono 192x192
- `icon-512.svg` - Icono 512x512  
- `favicon.svg` - Favicon
- `apple-touch-icon.svg` - Apple Touch Icon

## 🎨 **Configuración de Colores**

| Elemento | Color | Hex |
|----------|-------|-----|
| **Background Color** | Azul Púrpura | `#667eea` |
| **Theme Color** | Púrpura Oscuro | `#764ba2` |
| **Gradiente** | `#667eea` → `#764ba2` | Lineal 135° |

## 🚀 **Para Farcaster MiniApp**

### **Configuración Requerida:**
```json
{
  "splashBackgroundColor": "#667eea",
  "themeColor": "#764ba2",
  "splashImageUrl": "https://v0-rifa-pps-mini-app-development.vercel.app/api/og",
  "appUrl": "https://v0-rifa-pps-mini-app-development.vercel.app/lo-gane"
}
```

### **URLs Importantes:**
- **Frame URL**: `/api/frame`
- **Splash URL**: `/api/splash`  
- **Manifest**: `/manifest.json`
- **Config**: `/farcaster-splash.json`

## 🔧 **Configuración en Farcaster Studio**

1. **Ve a**: https://warpcast.com/~/developers/frames
2. **Frame URL**: `https://v0-rifa-pps-mini-app-development.vercel.app/api/frame`
3. **Splash Background**: `#667eea`
4. **Theme Color**: `#764ba2`

## 📱 **Características PWA**

### **Instalación:**
- ✅ Manifiesto completo
- ✅ Iconos en múltiples tamaños
- ✅ Service Worker ready
- ✅ Offline support

### **Shortcuts (Accesos Rápidos):**
- **Ver Rifas Activas** → `/lo-gane?tab=active`
- **Crear Nueva Rifa** → `/lo-gane?action=create`

## 🌐 **Meta Tags Configurados**

```html
<meta name="theme-color" content="#764ba2">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/apple-touch-icon.svg">
```

## 🔍 **Verificación**

### **URLs para Probar:**
1. **Manifest**: https://v0-rifa-pps-mini-app-development.vercel.app/manifest.json
2. **Frame**: https://v0-rifa-pps-mini-app-development.vercel.app/api/frame
3. **Splash**: https://v0-rifa-pps-mini-app-development.vercel.app/api/splash
4. **OG Image**: https://v0-rifa-pps-mini-app-development.vercel.app/api/og

### **Herramientas de Validación:**
- [Manifest Validator](https://manifest-validator.appspot.com/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Farcaster Frame Validator](https://warpcast.com/~/developers/frames)

## 📊 **Información del Contrato**

- **Dirección**: `0x6c593Ca0081b80e2bb447E080C0b8Cff4c76F8F4`
- **Red**: BASE Sepolia
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org

## ✅ **Checklist de Verificación**

- [x] Manifest.json creado y configurado
- [x] Iconos SVG generados (192, 512, favicon, apple-touch)
- [x] Splash screen configurado (#667eea)
- [x] Theme color configurado (#764ba2)
- [x] Frame de Farcaster funcional
- [x] Meta tags optimizados
- [x] PWA shortcuts configurados
- [x] Configuración blockchain incluida

## 🎉 **¡Tu MiniApp está Lista!**

Todos los archivos de configuración están creados y optimizados. Tu MiniApp:

- ✅ **Funciona** como PWA instalable
- ✅ **Se integra** perfectamente con Farcaster
- ✅ **Tiene** splash screen personalizado
- ✅ **Incluye** todos los iconos necesarios
- ✅ **Está** optimizada para móviles

### **Siguiente Paso:**
Publica tu Frame en Farcaster usando la URL: 
`https://v0-rifa-pps-mini-app-development.vercel.app/api/frame`
