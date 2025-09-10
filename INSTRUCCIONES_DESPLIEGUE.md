# 🚀 Instrucciones de Despliegue - Lo Gane

## ✅ Estado Actual
- ✅ Build exitoso
- ✅ Frame configurado
- ✅ Open Graph image creada
- ✅ MiniApp funcionando localmente

## 📋 Pasos para Desplegar

### 1. Login en Vercel
```bash
vercel login
# Selecciona "Continue with GitHub" o tu método preferido
```

### 2. Desplegar
```bash
vercel --prod
```

### 3. Configurar Variables de Entorno
En el dashboard de Vercel, agregar:
```
NEXT_PUBLIC_BASE_URL=https://tu-proyecto.vercel.app
RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS=0xTuContratoDesplegado
```

### 4. Crear Frame en Farcaster

1. Ve a [Farcaster Frame Studio](https://warpcast.com/~/developers/frames)
2. Usa la URL: `https://tu-proyecto.vercel.app/api/frame`
3. Configura los botones:
   - Botón 1: "🎲 Ver Rifas" → Link a `/lo-gane`
   - Botón 2: "🏆 Crear Rifa" → Link a `/lo-gane`

### 5. Publicar en Farcaster

1. Copia el código del Frame generado
2. Publica en Farcaster con el Frame
3. ¡Comparte con la comunidad!

## 🔗 URLs Importantes

- **Frame URL**: `https://tu-proyecto.vercel.app/api/frame`
- **MiniApp**: `https://tu-proyecto.vercel.app/lo-gane`
- **Open Graph**: `https://tu-proyecto.vercel.app/api/og`

## 🎯 Características del Frame

- ✅ Imagen Open Graph personalizada con diseño atractivo
- ✅ Botones de acción para ver y crear rifas
- ✅ Integración completa con MetaMask
- ✅ Conexión automática a BASE Sepolia
- ✅ Interfaz responsive y moderna
- ✅ Datos de ejemplo para demostración

## 📱 Testing Local

```bash
# Verificar Frame
curl http://localhost:3000/api/frame

# Verificar Open Graph
curl -I http://localhost:3000/api/og

# Verificar MiniApp
curl -I http://localhost:3000/lo-gane
```

## 🎉 ¡Listo para Farcaster!

Tu MiniApp "Lo Gane" está completamente preparada para ser compartida en Farcaster. Los usuarios podrán:

- Ver rifas activas con datos de ejemplo
- Conectar sus wallets MetaMask
- Navegar por la interfaz intuitiva
- Prepararse para participar en rifas reales

## 📝 Próximos Pasos

1. Desplegar en Vercel
2. Crear Frame en Farcaster
3. Publicar y compartir
4. Implementar funcionalidades completas del smart contract
5. Agregar más características avanzadas
