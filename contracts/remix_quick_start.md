# 🚀 Guía Rápida para Remix IDE - Logane Raffle V2

## ⚡ Configuración Express (5 minutos)

### 1. Abrir Remix IDE
- **URL**: https://remix.ethereum.org
- **Crear workspace**: "Logane Raffle V2"

### 2. Configurar Compilador
1. **Ir a**: Solidity Compiler
2. **Version**: `0.8.20`
3. **Advanced Configurations**: ✅ Habilitar
4. **Configurar**:
   ```
   Enable optimization: ✅
   Runs: 200
   viaIR: ✅          ← CLAVE PARA STACK TOO DEEP
   EVM Version: shanghai
   ```

### 3. Instalar OpenZeppelin
1. **File Manager** → **Connect to GitHub**
2. **Buscar**: `OpenZeppelin/openzeppelin-contracts`
3. **Versión**: `v4.9.3`
4. **Instalar en**: `lib/openzeppelin-contracts`

### 4. Crear Remappings
1. **Crear archivo**: `remappings.txt`
2. **Contenido**:
   ```
   @openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
   ```

### 5. Cargar Contrato
1. **Crear archivo**: `contracts/RaffleContractV2.sol`
2. **Copiar contenido** del archivo incluido
3. **Compilar**: Click en "Compile RaffleContractV2.sol"

## ✅ Verificación

### Debe aparecer:
- ✅ **Compilation successful**
- ✅ **No "Stack too deep" errors**
- ✅ **Bytecode generated**
- ✅ **ABI available**

## 🎯 Deploy

### Constructor Parameters:
```solidity
_feeRecipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
_treasury: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"  
_initialOwner: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
```

### Redes Disponibles:
- **Ethereum Sepolia** (Recomendado para pruebas)
- **Polygon Mumbai**
- **Arbitrum Sepolia**
- **Optimism Sepolia**
- **Base Sepolia**

## 🚨 Troubleshooting

### Error: "Stack too deep"
- **Solución**: Verificar que viaIR esté habilitado
- **Verificar**: Advanced Configurations → viaIR ✅

### Error: "Source not found"
- **Solución**: Verificar remappings.txt
- **Verificar**: OpenZeppelin instalado correctamente

### Error: "Compiler version mismatch"
- **Solución**: Usar Solidity 0.8.20
- **Verificar**: Compiler version en configuración

## 📁 Archivos Incluidos

1. **`contracts/RaffleContractV2.sol`** - Contrato principal
2. **`remix_workspace.json`** - Configuración del workspace
3. **`.remix/settings.json`** - Configuración del compilador
4. **`remix_setup.md`** - Guía detallada
5. **`remix_quick_start.md`** - Esta guía rápida

## 🎉 ¡Listo!

Con esta configuración, el contrato `RaffleContractV2` compilará sin problemas de "Stack too deep" y estará listo para deploy en cualquier red configurada.

---

**Autor**: Pablo Guzmán Sánchez  
**Versión**: 2.0  
**Solución**: viaIR (Recomendado por Solidity)

