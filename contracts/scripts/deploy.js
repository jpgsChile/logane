const { ethers } = require("hardhat")

async function main() {
  const network = await ethers.provider.getNetwork()
  const hre = require("hardhat")
  console.log("Deploying RaffleContract to BASE Sepolia...")
  console.log("Network:", network.name, "Chain ID:", network.chainId)

  // tomar la fábrica del contrato
  const RaffleContract = await ethers.getContractFactory("RaffleContract")

  // deployar el contrato
  const feeRecipient = process.env.FEE_RECIPIENT || "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
  console.log("Deploying with fee recipient:", feeRecipient)
  
  const raffleContract = await RaffleContract.deploy(feeRecipient)
  console.log("Transaction hash:", raffleContract.deployTransaction.hash)

  await raffleContract.deployed()

  console.log("✅ RaffleContract deployed to:", raffleContract.address)
  console.log("Fee recipient:", feeRecipient)
  
  // Configurar tokens de pago
  console.log("Configuring payment tokens...")
  const tx1 = await raffleContract.setTokenAddress(1, "0x036CbD53842c5426634e7929541eC2318f3dCF7e") // USDT
  await tx1.wait()
  console.log("✅ USDT address configured")
  
  const tx2 = await raffleContract.setTokenAddress(2, "0x036CbD53842c5426634e7929541eC2318f3dCF7e") // USDC
  await tx2.wait()
  console.log("✅ USDC address configured")

  // verificación del contrato en Etherscan
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("En espera de la configuración de la BLockchain...")
    await raffleContract.deployTransaction.wait(6)

    console.log("Verificando contrato...")
    try {
      await hre.run("verify:verify", {
        address: raffleContract.address,
        constructorArguments: [feeRecipient],
      })
    } catch (error) {
      console.log("Falló la verificación:", error.message)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
