# 🚀 Guía de Implementación - Logane Raffle V2

## 📋 Pasos para Implementar en Remix IDE

### **Paso 1: Configurar Workspace**
1. **Abrir Remix**: https://remix.ethereum.org
2. **Crear workspace**: "Logane Raffle V2"
3. **Template**: "Blank"

### **Paso 2: Configurar Compilador**
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

### **Paso 3: Instalar Dependencias**
1. **File Manager** → **Connect to GitHub**
2. **Buscar**: `OpenZeppelin/openzeppelin-contracts`
3. **Versión**: `v4.9.3`
4. **Instalar en**: `lib/openzeppelin-contracts`

### **Paso 4: Crear Archivos**

#### A. Crear carpeta `contracts/`
#### B. Crear archivo `contracts/RaffleContractV2.sol`
#### C. Crear archivo `remappings.txt` en la raíz

### **Paso 5: Compilar**
1. **Seleccionar**: `RaffleContractV2.sol`
2. **Click**: "Compile RaffleContractV2.sol"
3. **Verificar**: "Compilation successful"

### **Paso 6: Deploy**
1. **Ir a**: Deploy & Run
2. **Seleccionar**: RaffleContractV2
3. **Configurar parámetros del constructor**
4. **Click**: "Deploy"

## 🎯 Parámetros del Constructor

```solidity
constructor(
    address _feeRecipient,    // Dirección para comisiones
    address _treasury,        // Dirección del treasury
    address _initialOwner     // Dirección del owner
)
```

### **Ejemplo para Testnet**:
```javascript
_feeRecipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
_treasury: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
_initialOwner: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
```

## ✅ Verificación

### **Debe aparecer**:
- ✅ **Compilation successful**
- ✅ **No "Stack too deep" errors**
- ✅ **Bytecode generated**
- ✅ **ABI available**

## 🚨 Troubleshooting

### **Error: "Stack too deep"**
- **Solución**: Verificar que viaIR esté habilitado

### **Error: "Source not found"**
- **Solución**: Verificar que OpenZeppelin esté instalado

### **Error: "Compiler version mismatch"**
- **Solución**: Usar Solidity 0.8.20

