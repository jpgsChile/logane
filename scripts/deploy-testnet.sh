#!/bin/bash

echo "🚀 Desplegando Lo Gane en BASE Sepolia Testnet..."
echo "=================================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "contracts/hardhat.config.js" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Ir al directorio de contratos
cd contracts

echo "📦 Instalando dependencias..."
npm install

echo "🔨 Compilando contratos..."
npx hardhat compile

echo "🌐 Desplegando a BASE Sepolia..."
CONTRACT_ADDRESS=$(npx hardhat run scripts/deploy.js --network baseSepolia | grep "RaffleContract deployed to:" | cut -d: -f2 | xargs)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Error: No se pudo obtener la dirección del contrato"
    exit 1
fi

echo "✅ Contrato desplegado en: $CONTRACT_ADDRESS"

# Volver al directorio raíz
cd ..

# Actualizar el archivo de configuración
echo "📝 Actualizando configuración..."
echo "NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" > .env.local
echo "RPC_URL=https://sepolia.base.org" >> .env.local
echo "PRIVATE_KEY=cb13988dcad17d31a445a2195684839e7e365501717212d6b897c293dfdc8cc3" >> .env.local
echo "NEXT_PUBLIC_URL=http://localhost:3000" >> .env.local

echo "🎉 ¡Despliegue completado!"
echo "📋 Dirección del contrato: $CONTRACT_ADDRESS"
echo "🌐 Explorador: https://sepolia.basescan.org/address/$CONTRACT_ADDRESS"
echo ""
echo "🚀 Para iniciar la MiniApp:"
echo "1. npm install"
echo "2. npm run dev"
echo "3. Abre http://localhost:3000"
echo ""
echo "🧪 Para ejecutar pruebas:"
echo "CONTRACT_ADDRESS=$CONTRACT_ADDRESS node scripts/test-miniapp.js"
