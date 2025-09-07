#!/usr/bin/env node

const { ethers } = require("ethers");

// Configuración para BASE Sepolia
const RPC_URL = "https://sepolia.base.org";
const PRIVATE_KEY = "cb13988dcad17d31a445a2195684839e7e365501717212d6b897c293dfdc8cc3";

// ABI simplificado del contrato
const CONTRACT_ABI = [
  "function createRaffle(string memory _title, string memory _description, tuple(string name, string description, string imageUrl, uint256 value)[9] memory _prizes, uint256 _prizeCount, uint256 _ticketPrice, uint256 _maxParticipants, uint256 _duration, uint8 _paymentToken) external returns (uint256)",
  "function joinRaffle(uint256 _raffleId) external payable",
  "function drawWinners(uint256 _raffleId) external",
  "function getRaffle(uint256 _raffleId) external view returns (tuple(uint256 id, string title, string description, tuple(string name, string description, string imageUrl, uint256 value)[9] prizes, uint256 prizeCount, uint256 ticketPrice, uint256 maxParticipants, uint256 endTime, address creator, address[] participants, bool isActive, bool isDrawn, address[9] winners, uint256 createdAt, uint8 paymentToken))",
  "function getParticipantCount(uint256 _raffleId) external view returns (uint256)"
];

async function testMiniApp() {
  console.log("🚀 Iniciando pruebas de la MiniApp 'Lo Gane'...\n");

  try {
    // Conectar a la red
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log("📡 Conectado a BASE Sepolia");
    console.log("👤 Dirección del wallet:", wallet.address);
    
    // Verificar balance
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

    // Obtener dirección del contrato desplegado
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    if (!CONTRACT_ADDRESS) {
      console.error("❌ Error: CONTRACT_ADDRESS no está definido");
      console.log("💡 Ejecuta primero: npm run deploy:testnet");
      return;
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    console.log("📋 Contrato desplegado en:", CONTRACT_ADDRESS);

    // Test 1: Crear una rifa de prueba
    console.log("\n🎯 Test 1: Creando rifa de prueba...");
    
    const prizes = [
      { name: "iPhone 15 Pro", description: "Teléfono de última generación", imageUrl: "https://example.com/iphone.jpg", value: ethers.parseEther("0.5") },
      { name: "AirPods Pro", description: "Auriculares inalámbricos", imageUrl: "https://example.com/airpods.jpg", value: ethers.parseEther("0.2") },
      { name: "Gift Card $100", description: "Tarjeta de regalo", imageUrl: "https://example.com/giftcard.jpg", value: ethers.parseEther("0.1") }
    ];

    // Llenar el array con premios vacíos para llegar a 9
    while (prizes.length < 9) {
      prizes.push({ name: "", description: "", imageUrl: "", value: 0 });
    }

    const tx = await contract.createRaffle(
      "Rifa de Prueba Lo Gane",
      "Rifa de prueba para testing de la MiniApp",
      prizes,
      3, // 3 premios
      ethers.parseEther("0.01"), // 0.01 ETH por ticket
      10, // máximo 10 participantes
      3600, // 1 hora de duración
      0 // ETH como token de pago
    );

    console.log("⏳ Esperando confirmación de transacción...");
    const receipt = await tx.wait();
    console.log("✅ Rifa creada exitosamente!");
    console.log("📄 Transaction hash:", receipt.transactionHash);

    // Obtener ID de la rifa del evento
    const raffleCreatedEvent = receipt.logs.find(log => {
      try {
        const decoded = contract.interface.parseLog(log);
        return decoded.name === "RaffleCreated";
      } catch (e) {
        return false;
      }
    });

    if (raffleCreatedEvent) {
      const decoded = contract.interface.parseLog(raffleCreatedEvent);
      const raffleId = decoded.args.raffleId.toString();
      console.log("🆔 ID de la rifa:", raffleId);

      // Test 2: Obtener información de la rifa
      console.log("\n🎯 Test 2: Obteniendo información de la rifa...");
      const raffle = await contract.getRaffle(raffleId);
      console.log("📋 Título:", raffle.title);
      console.log("📝 Descripción:", raffle.description);
      console.log("🎁 Número de premios:", raffle.prizeCount.toString());
      console.log("💰 Precio del ticket:", ethers.formatEther(raffle.ticketPrice), "ETH");
      console.log("👥 Máximo participantes:", raffle.maxParticipants.toString());
      console.log("⏰ Fecha de finalización:", new Date(Number(raffle.endTime) * 1000).toLocaleString());
      console.log("🔄 Activa:", raffle.isActive);

      // Test 3: Simular participación (solo si hay balance suficiente)
      if (balance > ethers.parseEther("0.1")) {
        console.log("\n🎯 Test 3: Simulando participación...");
        
        // Crear un segundo wallet para simular otro participante
        const participantWallet = ethers.Wallet.createRandom().connect(provider);
        console.log("👤 Wallet participante:", participantWallet.address);
        
        // Nota: En testnet real necesitarías enviar ETH a este wallet
        console.log("💡 Nota: Para probar participación real, envía ETH de testnet a:", participantWallet.address);
      }

      console.log("\n✅ Pruebas completadas exitosamente!");
      console.log("\n📱 Para probar la MiniApp:");
      console.log("1. Ejecuta: npm run dev");
      console.log("2. Abre: http://localhost:3000");
      console.log("3. Conecta tu wallet MetaMask a BASE Sepolia");
      console.log("4. Usa la dirección del contrato:", CONTRACT_ADDRESS);
      console.log("5. Crea y participa en rifas!");

    } else {
      console.log("⚠️ No se pudo obtener el ID de la rifa del evento");
    }

  } catch (error) {
    console.error("❌ Error durante las pruebas:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solución: Obtén ETH de testnet desde:");
      console.log("🔗 https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    }
  }
}

// Ejecutar pruebas
testMiniApp();
