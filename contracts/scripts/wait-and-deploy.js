const { ethers } = require("hardhat");

async function waitForETHAndDeploy() {
  const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("🔍 Verificando balance de ETH...");
  console.log("Address:", wallet.address);
  
  let balance = await provider.getBalance(wallet.address);
  console.log("Balance actual:", ethers.utils.formatEther(balance), "ETH");
  
  if (balance.gt(0)) {
    console.log("✅ ¡ETH encontrado! Procediendo con el despliegue...");
    await deployContract();
  } else {
    console.log("❌ No hay ETH. Esperando...");
    console.log("💡 Obtén ETH desde: https://sepoliafaucet.com/");
    console.log("🔄 Verificando cada 30 segundos...");
    
    const interval = setInterval(async () => {
      balance = await provider.getBalance(wallet.address);
      console.log("Balance:", ethers.utils.formatEther(balance), "ETH");
      
      if (balance.gt(0)) {
        clearInterval(interval);
        console.log("✅ ¡ETH recibido! Procediendo con el despliegue...");
        await deployContract();
      }
    }, 30000);
  }
}

async function deployContract() {
  try {
    console.log("🚀 Desplegando RaffleContract...");
    
    const RaffleContract = await ethers.getContractFactory("RaffleContract");
    const feeRecipient = process.env.FEE_RECIPIENT || "0xABc0c63092fDd17BF2bf69e2F94DC15f46AF39D9";
    
    console.log("Fee recipient:", feeRecipient);
    
    const raffleContract = await RaffleContract.deploy(feeRecipient);
    console.log("⏳ Esperando confirmación...");
    
    await raffleContract.deployed();
    
    console.log("✅ ¡Contrato desplegado exitosamente!");
    console.log("📍 Dirección del contrato:", raffleContract.address);
    console.log("🔗 Explorador:", `https://sepolia.basescan.org/address/${raffleContract.address}`);
    
    // Configurar tokens de pago
    console.log("🔧 Configurando tokens de pago...");
    
    const tx1 = await raffleContract.setTokenAddress(1, "0x036CbD53842c5426634e7929541eC2318f3dCF7e"); // USDT
    await tx1.wait();
    console.log("✅ USDT configurado");
    
    const tx2 = await raffleContract.setTokenAddress(2, "0x036CbD53842c5426634e7929541eC2318f3dCF7e"); // USDC
    await tx2.wait();
    console.log("✅ USDC configurado");
    
    console.log("\n🎉 ¡Despliegue completado!");
    console.log("📋 Próximos pasos:");
    console.log("1. Copia la dirección del contrato:", raffleContract.address);
    console.log("2. Actualiza .env.local con esta dirección");
    console.log("3. Ejecuta: npm run dev");
    console.log("4. Abre: http://localhost:3000/lo-gane");
    
  } catch (error) {
    console.error("❌ Error durante el despliegue:", error.message);
  }
}

waitForETHAndDeploy();
