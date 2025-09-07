const { ethers } = require("hardhat");

async function main() {
  const network = await ethers.provider.getNetwork();
  const hre = require("hardhat");
  console.log("🚀 Desplegando RaffleContract optimizado a BASE Sepolia...");
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Verificar balance antes del despliegue
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  console.log("💰 Balance del deployer:", ethers.utils.formatEther(balance), "ETH");
  
  if (balance.lt(ethers.utils.parseEther("0.001"))) {
    console.log("❌ Balance insuficiente. Necesitas al menos 0.001 ETH");
    console.log("💡 Obtén más ETH desde: https://sepoliafaucet.com/");
    return;
  }

  // tomar la fábrica del contrato
  const RaffleContract = await ethers.getContractFactory("RaffleContract");

  // deployar el contrato con configuración optimizada
  const feeRecipient = process.env.FEE_RECIPIENT || "0xABc0c63092fDd17BF2bf69e2F94DC15f46AF39D9";
  console.log("Deploying with fee recipient:", feeRecipient);
  
  // Configuración optimizada de gas
  const gasPrice = ethers.utils.parseUnits("1", "gwei"); // 1 gwei
  const gasLimit = 3000000; // 3M gas limit
  
  console.log("⏳ Desplegando contrato...");
  const raffleContract = await RaffleContract.deploy(feeRecipient, {
    gasPrice: gasPrice,
    gasLimit: gasLimit
  });
  
  console.log("Transaction hash:", raffleContract.deployTransaction.hash);
  console.log("⏳ Esperando confirmación...");

  await raffleContract.deployed();

  console.log("✅ ¡Contrato desplegado exitosamente!");
  console.log("📍 Dirección del contrato:", raffleContract.address);
  console.log("🔗 Explorador:", `https://sepolia.basescan.org/address/${raffleContract.address}`);
  
  // Configurar tokens de pago (solo si hay suficiente gas)
  try {
    console.log("🔧 Configurando tokens de pago...");
    
    const tx1 = await raffleContract.setTokenAddress(1, "0x036CbD53842c5426634e7929541eC2318f3dCF7e", {
      gasPrice: gasPrice,
      gasLimit: 100000
    }); // USDT
    await tx1.wait();
    console.log("✅ USDT configurado");
    
    const tx2 = await raffleContract.setTokenAddress(2, "0x036CbD53842c5426634e7929541eC2318f3dCF7e", {
      gasPrice: gasPrice,
      gasLimit: 100000
    }); // USDC
    await tx2.wait();
    console.log("✅ USDC configurado");
  } catch (error) {
    console.log("⚠️ Error configurando tokens:", error.message);
    console.log("💡 Puedes configurarlos manualmente después");
  }

  // verificación del contrato en Etherscan
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("⏳ Esperando confirmaciones para verificación...");
    await raffleContract.deployTransaction.wait(6);

    console.log("🔍 Verificando contrato...");
    try {
      await hre.run("verify:verify", {
        address: raffleContract.address,
        constructorArguments: [feeRecipient],
      });
      console.log("✅ Contrato verificado en Basescan");
    } catch (error) {
      console.log("⚠️ Falló la verificación:", error.message);
    }
  }
  
  console.log("\n🎉 ¡Despliegue completado!");
  console.log("📋 Próximos pasos:");
  console.log("1. Copia la dirección del contrato:", raffleContract.address);
  console.log("2. Actualiza .env.local con esta dirección");
  console.log("3. Ejecuta: npm run dev");
  console.log("4. Abre: http://localhost:3000/lo-gane");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error durante el despliegue:", error);
    process.exit(1);
  });

