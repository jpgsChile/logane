# 🚀 Despliegue en Farcaster - Lo Gane

## 📋 Pasos para Publicar en Farcaster

### 1. Desplegar en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### 2. Configurar Variables de Entorno

En el dashboard de Vercel, agregar:

```
NEXT_PUBLIC_BASE_URL=https://tu-proyecto.vercel.app
RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS=0xTuContratoDesplegado
```

### 3. Crear Frame en Farcaster

1. Ve a [Farcaster Frame Studio](https://warpcast.com/~/developers/frames)
2. Usa la URL: `https://tu-proyecto.vercel.app/api/frame`
3. Configura los botones:
   - Botón 1: "🎲 Ver Rifas" → Link a `/lo-gane`
   - Botón 2: "🏆 Crear Rifa" → Link a `/lo-gane`

### 4. Publicar el Frame

1. Copia el código del Frame generado
2. Publica en Farcaster con el Frame
3. ¡Comparte con la comunidad!

## 🔗 URLs Importantes

- **Frame URL**: `https://tu-proyecto.vercel.app/api/frame`
- **MiniApp**: `https://tu-proyecto.vercel.app/lo-gane`
- **Open Graph**: `https://tu-proyecto.vercel.app/api/og`

## 🎯 Características del Frame

- ✅ Imagen Open Graph personalizada
- ✅ Botones de acción para ver y crear rifas
- ✅ Integración con MetaMask
- ✅ Conexión automática a BASE Sepolia
- ✅ Interfaz responsive

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Verificar Frame localmente
curl http://localhost:3000/api/frame
```

## 📱 Testing

1. Abre la MiniApp en tu navegador
2. Conecta MetaMask a BASE Sepolia
3. Prueba la navegación entre secciones
4. Verifica que los botones del Frame funcionen

## 🎉 ¡Listo para Farcaster!

Tu MiniApp "Lo Gane" está lista para ser compartida en Farcaster. Los usuarios podrán:

- Ver rifas activas
- Conectar sus wallets
- Participar en rifas (próximamente)
- Crear nuevas rifas (próximamente)
