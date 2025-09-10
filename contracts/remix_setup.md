# Configuración para Remix IDE - Logane Raffle V2

## 📁 Archivos Necesarios para Remix

### 1. Estructura de Carpetas
```
remix_workspace/
├── contracts/
│   └── RaffleContractV2.sol
├── remix_workspace.json
├── .remix/
│   └── settings.json
└── README.md
```

### 2. Archivos a Crear en Remix

#### A. RaffleContractV2.sol
- **Ubicación**: `contracts/RaffleContractV2.sol`
- **Contenido**: El contrato principal (ya incluido)

#### B. remix_workspace.json
- **Ubicación**: Raíz del workspace
- **Contenido**: Configuración del proyecto con viaIR

#### C. .remix/settings.json
```json
{
  "compiler": {
    "version": "0.8.20",
    "settings": {
      "optimizer": {
        "enabled": true,
        "runs": 200
      },
      "viaIR": true,
      "evmVersion": "shanghai"
    }
  }
}
```

## 🚀 Pasos para Configurar en Remix

### Paso 1: Crear Workspace
1. **Abrir Remix**: https://remix.ethereum.org
2. **Crear nuevo workspace**: "Logane Raffle V2"
3. **Seleccionar template**: "Blank"

### Paso 2: Configurar Compilador
1. **Ir a Solidity Compiler**
2. **Configurar**:
   - Version: `0.8.20`
   - Language: `Solidity`
   - Compiler Configuration: `Manual`
   - Advanced Configurations: ✅ **Habilitar**

### Paso 3: Configuración Avanzada
En **Advanced Configurations**:
```json
{
  "optimizer": {
    "enabled": true,
    "runs": 200
  },
  "viaIR": true,
  "evmVersion": "shanghai"
}
```

### Paso 4: Instalar Dependencias
1. **Ir a File Manager**
2. **Crear carpeta**: `lib`
3. **Instalar OpenZeppelin**:
   - Click en "Connect to GitHub"
   - Buscar: `OpenZeppelin/openzeppelin-contracts`
   - Seleccionar versión: `v4.9.3`
   - Instalar en: `lib/openzeppelin-contracts`

### Paso 5: Configurar Remappings
1. **Crear archivo**: `remappings.txt`
2. **Contenido**:
```
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
```

## 🔧 Configuración del Compilador

### Opción 1: Configuración Manual
1. **Solidity Compiler** → **Advanced Configurations**
2. **Habilitar**:
   - ✅ Enable optimization
   - ✅ viaIR
3. **Configurar**:
   - Runs: `200`
   - EVM Version: `shanghai`

### Opción 2: Archivo de Configuración
1. **Crear archivo**: `remix.config.json`
2. **Copiar contenido** del archivo incluido
3. **Seleccionar**: "Load from file"

## 📋 Verificación de Compilación

### ✅ Checklist de Verificación
- [ ] Compilador versión 0.8.20
- [ ] viaIR habilitado
- [ ] Optimizer habilitado (200 runs)
- [ ] OpenZeppelin instalado
- [ ] Remappings configurados
- [ ] Sin errores de compilación

### 🚨 Errores Comunes y Soluciones

#### Error: "Stack too deep"
- **Solución**: Verificar que viaIR esté habilitado
- **Verificar**: Advanced Configurations → viaIR ✅

#### Error: "Source not found"
- **Solución**: Verificar remappings
- **Verificar**: `@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/`

#### Error: "Compiler version mismatch"
- **Solución**: Usar Solidity 0.8.20
- **Verificar**: Compiler version en configuración

## 🎯 Deploy del Contrato

### Constructor Parameters
```solidity
constructor(
    address _feeRecipient,    // Dirección para recibir comisiones
    address _treasury,        // Dirección del treasury
    address _initialOwner     // Dirección del owner inicial
)
```

### Ejemplo de Deploy
```javascript
// En Remix Deploy & Run
_feeRecipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
_treasury: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
_initialOwner: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
```

## 📊 Configuración de Redes

### Testnets Recomendadas
- **Sepolia**: Para pruebas de Ethereum
- **Mumbai**: Para pruebas de Polygon
- **Arbitrum Sepolia**: Para pruebas de Arbitrum
- **Optimism Sepolia**: Para pruebas de Optimism
- **Base Sepolia**: Para pruebas de Base

### Variables de Entorno
```bash
# Para configuración de redes
ALCHEMY_API_KEY=your_alchemy_key
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

## ✅ Estado Final

Con esta configuración, el contrato `RaffleContractV2` debería:
- ✅ Compilar sin errores de "Stack too deep"
- ✅ Generar bytecode correctamente
- ✅ Estar listo para deploy
- ✅ Funcionar en todas las redes configuradas

---

**Autor**: Pablo Guzmán Sánchez
**Versión**: 2.0
**Fecha**: $(date)

