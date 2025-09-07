const { ethers } = require("hardhat")

async function main() {
  const network = await ethers.provider.getNetwork()
  const hre = require("hardhat")
  console.log("Deploying RaffleContract...")

  // Get the contract factory
  const RaffleContract = await ethers.getContractFactory("RaffleContract")

  // Deploy the contract
  const feeRecipient = process.env.FEE_RECIPIENT || "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
  const raffleContract = await RaffleContract.deploy(feeRecipient)

  await raffleContract.deployed()

  console.log("RaffleContract deployed to:", raffleContract.address)
  console.log("Fee recipient:", feeRecipient)

  // Verify contract on Etherscan (if not localhost)
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("Waiting for block confirmations...")
    await raffleContract.deployTransaction.wait(6)

    console.log("Verifying contract...")
    try {
      await hre.run("verify:verify", {
        address: raffleContract.address,
        constructorArguments: [feeRecipient],
      })
    } catch (error) {
      console.log("Verification failed:", error.message)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
