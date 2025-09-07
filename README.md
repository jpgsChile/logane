# 🏆 Logane - Premios Descentralizados Transparentes

## 🚀 La Plataforma Disruptiva de Premios en Farcaster

Logane revoluciona el concepto tradicional de premios y sorteos, transformándolos en un sistema transparente, descentralizado y beneficioso que convierte el reparto tradicional en un fondo a beneficio con transparencia y sellado descentralizado. Construida como una Mini App nativa para Farcaster en BASE blockchain, Logane elimina la opacidad y desconfianza de los sorteos tradicionales mediante smart contracts auditables y transparencia total.

### ✨ Propuesta de Valor Disruptiva

- **🔒 Transparencia Total**: Todos los premios son distribuidos por smart contracts auditables en BASE blockchain
- **🎲 Sorteos Verificables**: Utiliza Chainlink VRF para garantizar distribución de premios completamente aleatoria e imparcial  
- **💰 Fondos Seguros**: Los pagos se mantienen en escrow hasta la distribución de premios
- **🏆 Múltiples Premios**: Soporte para hasta 9 premios por sorteo con distribución automática
- **💳 Múltiples Tokens**: Acepta pagos en ETH, USDC y USDT
- **📱 Integración Nativa**: Funciona directamente dentro de Farcaster sin salir de la plataforma

## 🏗️ Arquitectura del Sistema

### Frontend (Next.js + TypeScript)
- **Mini App de Farcaster**: Integración completa con `@farcaster/miniapp-sdk`
- **UI Moderna**: Diseño responsivo con shadcn/ui y Tailwind CSS
- **Conexión Web3**: Soporte para MetaMask y wallets compatibles
- **UX Optimizada**: Interfaz intuitiva para crear sorteos y ganar premios

### Backend (Next.js API Routes)
- **API RESTful**: Endpoints para gestión completa de sorteos de premios
- **Integración Blockchain**: Comunicación directa con smart contracts
- **Validación de Datos**: Validación robusta de entradas y estados
- **Manejo de Archivos**: Soporte para imágenes de premios via Vercel Blob

### Smart Contracts (Solidity)
- **Contrato Principal**: `RaffleContract.sol` con funcionalidad completa de premios
- **Seguridad**: Implementa ReentrancyGuard y controles de acceso
- **Tokens ERC20**: Soporte nativo para USDC y USDT
- **Eventos**: Emisión de eventos para transparencia total en distribución de premios

## 🛠️ Tecnologías Utilizadas

- **Blockchain**: BASE (Ethereum L2)
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, ethers.js
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Integración**: Farcaster Mini App SDK, Chainlink VRF
- **Almacenamiento**: Vercel Blob para imágenes
- **Despliegue**: Vercel en logane.xyz

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Wallet compatible (MetaMask recomendado)
- Cuenta en Vercel (para despliegue)

### 1. Clonar el Repositorio
\`\`\`bash
git clone https://github.com/logane-team/logane.git
cd logane
\`\`\`

### 2. Instalar Dependencias
\`\`\`bash
npm install
# o
yarn install
\`\`\`

### 3. Configurar Variables de Entorno
Crear `.env.local` con las siguientes variables:

\`\`\`env
# Blockchain Configuration
NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS=0x...
RPC_URL=https://mainnet.base.org
PRIVATE_KEY=tu_private_key_para_deploy

# Farcaster Configuration  
NEXT_PUBLIC_URL=https://logane.xyz
NEYNAR_API_KEY=tu_neynar_api_key

# Vercel Blob (para imágenes)
BLOB_READ_WRITE_TOKEN=tu_blob_token

# Chainlink VRF (para aleatoriedad)
VRF_COORDINATOR=0x...
VRF_KEY_HASH=0x...
VRF_SUBSCRIPTION_ID=123
\`\`\`

### 4. Desplegar Smart Contracts
\`\`\`bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network base
\`\`\`

### 5. Ejecutar en Desarrollo
\`\`\`bash
npm run dev
\`\`\`

## 📱 Cómo Usar Logane

### Para Creadores de Sorteos
1. **Conectar Wallet**: Conecta tu wallet compatible con BASE
2. **Crear Sorteo**: Define premios (hasta 9), precio de participación y fecha límite
3. **Seleccionar Token**: Elige entre ETH, USDC o USDT para los pagos
4. **Publicar**: El sorteo se crea automáticamente en el smart contract
5. **Compartir**: Comparte en Farcaster para que otros participen y ganen premios

### Para Ganadores de Premios
1. **Explorar Sorteos**: Ve sorteos activos directamente en Farcaster
2. **Seleccionar Sorteo**: Revisa premios disponibles, precio y participantes actuales
3. **Participar**: Paga con el token especificado (ETH, USDC, USDT)
4. **Esperar Sorteo**: El sorteo se ejecuta automáticamente en la fecha programada
5. **Reclamar Premio**: Los ganadores reciben sus premios automáticamente

## 🔐 Seguridad y Transparencia

- **Código Abierto**: Todo el código es auditable y verificable
- **Smart Contracts Inmutables**: Una vez desplegados, no pueden ser modificados
- **Aleatoriedad Verificable**: Chainlink VRF garantiza sorteos justos
- **Fondos en Escrow**: Los pagos se mantienen seguros hasta la distribución
- **Eventos Blockchain**: Todas las acciones quedan registradas permanentemente

## 🌐 Configuración de Mini App

El archivo `.well-known/farcaster.json` configura la integración con Farcaster:

\`\`\`json
{
  "accountAssociation": {
    "header": "farcaster-miniapp-domain-verification",
    "payload": "logane.xyz"
  },
  "frame": {
    "name": "Logane - Premios Descentralizados",
    "iconUrl": "https://logane.xyz/icon-192x192.jpg",
    "homeUrl": "https://logane.xyz",
    "imageUrl": "https://logane.xyz/og-image.jpg"
  }
}
\`\`\`

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/logane-team/logane/issues)
- **Documentación**: [Wiki del Proyecto](https://github.com/logane-team/logane/wiki)
- **Farcaster**: Menciona @logane en Farcaster para soporte
- **Web**: [logane.xyz](https://logane.xyz)

---

**Logane** - Transformando sorteos tradicionales en experiencias transparentes de premios descentralizados 🏆✨
