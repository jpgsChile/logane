# 🧪 Guía Completa de Testing - Lo Gane

## 📋 Prerrequisitos

### 1. Software Necesario
- ✅ Node.js 18+
- ✅ MetaMask instalado
- ✅ Git

### 2. Cuentas Necesarias
- ✅ Cuenta de Coinbase/Alchemy para faucet
- ✅ Wallet MetaMask configurada

## 🚀 Pasos para Configurar y Probar

### Paso 1: Configurar el Proyecto

```bash
# Clonar y configurar
cd /home/jpgchile/logane
npm install

# Configurar variables de entorno
cp config-testnet.env .env.local
```

### Paso 2: Desplegar el Smart Contract

```bash
# Desplegar a BASE Sepolia
npm run deploy:testnet

# O manualmente:
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network baseSepolia
```

**Resultado esperado:**
```
✅ RaffleContract deployed to: 0x...
✅ USDT address configured
✅ USDC address configured
```

### Paso 3: Configurar MetaMask

1. **Abrir MetaMask**
2. **Agregar Red BASE Sepolia:**
   - Chain ID: 84532
   - RPC URL: https://sepolia.base.org
   - Block Explorer: https://sepolia.basescan.org

3. **Obtener ETH de testnet:**
   - Visita: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - Pega tu dirección de wallet
   - Espera la transacción

### Paso 4: Iniciar la MiniApp

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
open http://localhost:3000/lo-gane
```

### Paso 5: Probar Funcionalidades

#### 5.1 Conectar Wallet
1. Abrir http://localhost:3000/lo-gane
2. Hacer clic en "Conectar MetaMask"
3. Aceptar la conexión
4. Verificar que aparezca "Red correcta configurada"

#### 5.2 Crear una Rifa
1. Ir a la pestaña "Crear Rifa"
2. Llenar el formulario:
   - Título: "Rifa de Prueba"
   - Descripción: "Testing de la MiniApp"
   - Número de premios: 3
   - Premio 1: iPhone 15 Pro, 0.5 ETH
   - Premio 2: AirPods Pro, 0.2 ETH
   - Premio 3: Gift Card, 0.1 ETH
   - Precio por ticket: 0.01 ETH
   - Máximo participantes: 10
   - Duración: 1 día
   - Token de pago: ETH
3. Hacer clic en "Crear Rifa"
4. Confirmar la transacción en MetaMask

#### 5.3 Participar en una Rifa
1. Ir a la pestaña "Rifas Activas"
2. Seleccionar una rifa
3. Hacer clic en "Participar"
4. Confirmar la transacción en MetaMask

#### 5.4 Sorteo de Ganadores
1. Esperar a que termine la rifa
2. Hacer clic en "Sortear Ganadores"
3. Confirmar la transacción en MetaMask
4. Ver los ganadores seleccionados

## 🧪 Tests Automatizados

### Test del Smart Contract

```bash
# Ejecutar tests del contrato
npm run test:contract

# Test específico de la MiniApp
npm run test:miniapp
```

### Test Manual de la MiniApp

```bash
# Ejecutar script de testing
CONTRACT_ADDRESS=0x... node scripts/test-miniapp.js
```

## 🔍 Verificación de Funcionalidades

### ✅ Checklist de Testing

- [ ] **Conexión de Wallet**
  - [ ] MetaMask se conecta correctamente
  - [ ] Red BASE Sepolia configurada
  - [ ] Balance de ETH visible

- [ ] **Creación de Rifas**
  - [ ] Formulario funciona correctamente
  - [ ] Validaciones funcionan
  - [ ] Transacción se ejecuta
  - [ ] Rifa aparece en la lista

- [ ] **Participación en Rifas**
  - [ ] Usuario puede participar
  - [ ] Pago se procesa correctamente
  - [ ] Contador de participantes se actualiza

- [ ] **Sorteo de Ganadores**
  - [ ] Sorteo se ejecuta al finalizar
  - [ ] Ganadores se seleccionan correctamente
  - [ ] Premios se distribuyen

- [ ] **Interfaz de Usuario**
  - [ ] Responsive en móvil
  - [ ] Navegación fluida
  - [ ] Estados de carga visibles
  - [ ] Errores se muestran correctamente

## 🐛 Troubleshooting

### Error: "MetaMask no está instalado"
**Solución:** Instalar MetaMask desde https://metamask.io

### Error: "Insufficient funds"
**Solución:** 
1. Verificar que estés en BASE Sepolia
2. Obtener ETH del faucet
3. Verificar balance en MetaMask

### Error: "Network not found"
**Solución:**
1. Agregar BASE Sepolia manualmente en MetaMask
2. Verificar Chain ID: 84532
3. Verificar RPC URL: https://sepolia.base.org

### Error: "Transaction failed"
**Solución:**
1. Aumentar gas limit
2. Verificar que tengas suficiente ETH
3. Esperar a que la red esté menos congestionada

### Error: "Contract not deployed"
**Solución:**
1. Verificar que el contrato esté desplegado
2. Verificar la dirección en .env.local
3. Re-desplegar si es necesario

## 📊 Métricas de Testing

### Tiempo de Respuesta
- Conexión de wallet: < 3 segundos
- Creación de rifa: < 30 segundos
- Participación: < 15 segundos
- Sorteo: < 45 segundos

### Gas Usage
- Crear rifa: ~200,000 gas
- Participar: ~100,000 gas
- Sortear: ~300,000 gas

## 🎯 Casos de Uso de Prueba

### Caso 1: Rifa Simple
- 1 premio, 5 participantes
- Verificar que el ganador reciba el 100%

### Caso 2: Rifa Múltiple
- 3 premios, 10 participantes
- Verificar distribución: 60%, 25%, 15%

### Caso 3: Rifa Máxima
- 9 premios, 20 participantes
- Verificar que todos los premios se asignen

### Caso 4: Rifa con Tokens ERC20
- USDC como token de pago
- Verificar transferencias correctas

## 📱 Testing en Móvil

1. **Abrir en navegador móvil**
2. **Conectar MetaMask Mobile**
3. **Probar todas las funcionalidades**
4. **Verificar responsive design**

## 🔒 Testing de Seguridad

- [ ] Verificar que solo el creador pueda sortear
- [ ] Verificar que no se puedan participar dos veces
- [ ] Verificar que los fondos estén seguros
- [ ] Verificar que la aleatoriedad sea justa

## 📈 Performance Testing

- [ ] Carga inicial < 3 segundos
- [ ] Transiciones suaves
- [ ] Sin memory leaks
- [ ] Optimización de gas

---

**¡Listo para probar!** 🚀

Sigue estos pasos y tendrás una MiniApp completamente funcional de rifas descentralizadas en BASE Sepolia.
