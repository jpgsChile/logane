# Instrucciones para Compilar en Remix IDE

## Configuración para Resolver Stack Too Deep

### Opción 1: Configuración Automática (Recomendada)

1. **Abrir Remix IDE**: https://remix.ethereum.org
2. **Cargar el proyecto**: Importar todos los archivos del contrato
3. **Ir a la pestaña "Solidity Compiler"**
4. **Configurar el compilador**:
   - **Version**: `0.8.20`
   - **Language**: `Solidity`
   - **Compiler Configuration**: `Manual`
   - **Advanced Configurations**: ✅ Habilitar

### Opción 2: Configuración Manual

En la sección **Advanced Configurations** de Remix:

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

### Opción 3: Usar archivo de configuración

1. **Crear archivo**: `remix.config.json` en la raíz del proyecto
2. **Copiar el contenido** del archivo `remix.config.json` incluido
3. **Seleccionar**: "Load from file" en Remix

## Pasos Detallados

### 1. Configurar el Compilador

1. **Abrir Remix IDE**
2. **Navegar a**: `Solidity Compiler` (pestaña izquierda)
3. **Seleccionar versión**: `0.8.20`
4. **Habilitar**: `Advanced Configurations`
5. **Configurar**:
   ```
   Enable optimization: ✅
   Runs: 200
   viaIR: ✅
   EVM Version: shanghai
   ```

### 2. Compilar el Contrato

1. **Seleccionar archivo**: `RaffleContractV2.sol`
2. **Hacer clic en**: `Compile RaffleContractV2.sol`
3. **Verificar**: Sin errores de compilación

### 3. Verificar la Compilación

- ✅ **Sin errores de "Stack too deep"**
- ✅ **Bytecode generado correctamente**
- ✅ **ABI disponible**
- ✅ **Gas estimates calculados**

## Configuración Alternativa para Hardhat

Si usas Hardhat, añadir a `hardhat.config.js`:

```javascript
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  }
};
```

## Configuración para Truffle

Si usas Truffle, añadir a `truffle-config.js`:

```javascript
module.exports = {
  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        viaIR: true
      }
    }
  }
};
```

## ¿Qué es viaIR?

**viaIR** (via Intermediate Representation) es una nueva característica del compilador de Solidity que:

- ✅ **Resuelve Stack Too Deep**: Permite manejar más variables locales
- ✅ **Mejor optimización**: Optimizaciones más avanzadas
- ✅ **Compatibilidad**: Funciona con contratos complejos
- ✅ **Gas eficiente**: Mejora la eficiencia del bytecode

## Ventajas de viaIR

1. **No requiere refactorización**: Mantiene el código original
2. **Mejor optimización**: Optimizaciones más avanzadas
3. **Resuelve Stack Too Deep**: Automáticamente
4. **Compatible**: Con todas las versiones de Solidity 0.8.0+

## Troubleshooting

### Si aún hay errores:

1. **Verificar versión**: Asegurar que es Solidity 0.8.20
2. **Habilitar optimizer**: Debe estar habilitado
3. **Verificar viaIR**: Debe estar marcado como true
4. **Limpiar cache**: Limpiar y recompilar

### Errores comunes:

- **"viaIR requires optimizer"**: Habilitar optimizer
- **"Unsupported EVM version"**: Usar "shanghai" o "paris"
- **"Compiler version mismatch"**: Verificar versión 0.8.20

## Verificación Final

Después de compilar con viaIR:

- ✅ **Sin errores de compilación**
- ✅ **Bytecode generado**
- ✅ **ABI disponible**
- ✅ **Gas estimates correctos**
- ✅ **Listo para deployment**

---

**Nota**: viaIR es la solución recomendada por el equipo de Solidity para resolver problemas de "Stack too deep" sin necesidad de refactorizar el código.

