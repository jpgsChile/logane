# 🚀 Despliegue en Vercel - Lo Gane

## ✅ Estado Actual
- ✅ Build exitoso localmente
- ✅ Errores de importación corregidos
- ✅ Archivo `lib/utils.ts` creado
- ✅ Configuración de Vercel lista

## 🔧 Pasos para Desplegar

### 1. Login en Vercel
```bash
vercel login
# Selecciona tu método de autenticación preferido
```

### 2. Desplegar
```bash
vercel --prod
```

### 3. Configurar Variables de Entorno en Vercel Dashboard

Ve a tu proyecto en Vercel y agrega estas variables:

```
NEXT_PUBLIC_BASE_URL=https://v0-rifa-pps-mini-app-development.vercel.app
RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS=0xTuContratoDesplegado
```

### 4. URLs del Proyecto

- **Frame de Farcaster**: `https://v0-rifa-pps-mini-app-development.vercel.app/api/frame`
- **MiniApp**: `https://v0-rifa-pps-mini-app-development.vercel.app/lo-gane`
- **Open Graph**: `https://v0-rifa-pps-mini-app-development.vercel.app/api/og`

## 🎯 Características del Despliegue

- ✅ **Build exitoso** sin errores
- ✅ **Frame de Farcaster** configurado
- ✅ **MiniApp funcional** con conexión MetaMask
- ✅ **Imagen Open Graph** generada dinámicamente
- ✅ **Configuración de Vercel** optimizada

## 🔗 Crear Frame en Farcaster

1. Ve a [Farcaster Frame Studio](https://warpcast.com/~/developers/frames)
2. Usa la URL: `https://v0-rifa-pps-mini-app-development.vercel.app/api/frame`
3. Configura los botones:
   - Botón 1: "🎲 Ver Rifas" → Link a `/lo-gane`
   - Botón 2: "🏆 Crear Rifa" → Link a `/lo-gane`

## 🎉 ¡Listo para Farcaster!

Tu MiniApp "Lo Gane" está completamente preparada para ser compartida en Farcaster.

### Próximos pasos:
1. Hacer login en Vercel
2. Desplegar con `vercel --prod`
3. Crear Frame en Farcaster
4. ¡Publicar y compartir!
