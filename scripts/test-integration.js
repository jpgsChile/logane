const { ethers } = require("hardhat")
const { expect } = require("chai")

async function testLoganeIntegration() {
  console.log("[v0] Starting Logane integration tests...")

  try {
    // Test contract deployment
    console.log("[v0] Testing contract deployment...")
    const RaffleContract = await ethers.getContractFactory("RaffleContract")
    const raffle = await RaffleContract.deploy()
    await raffle.deployed()
    console.log("[v0] Contract deployed successfully at:", raffle.address)

    // Test raffle creation with multiple tokens
    console.log("[v0] Testing raffle creation with ETH...")
    const prizes = ["iPhone 15", "MacBook Pro", "AirPods Pro"]
    const entryFee = ethers.utils.parseEther("0.01")
    const maxParticipants = 100
    const drawDate = Math.floor(Date.now() / 1000) + 86400 // 24 hours from now

    const tx = await raffle.createRaffle(
      prizes,
      entryFee,
      0, // ETH payment token
      maxParticipants,
      drawDate,
    )
    await tx.wait()
    console.log("[v0] Raffle created successfully")

    // Test participation
    console.log("[v0] Testing raffle participation...")
    const [owner, participant] = await ethers.getSigners()
    const participateTx = await raffle.connect(participant).participate(0, {
      value: entryFee,
    })
    await participateTx.wait()
    console.log("[v0] Participation successful")

    // Verify raffle state
    const raffleInfo = await raffle.getRaffle(0)
    console.log("[v0] Raffle participants:", raffleInfo.participants.length)
    console.log("[v0] Prize pool:", ethers.utils.formatEther(raffleInfo.prizePool))

    console.log("[v0] All integration tests passed! ✅")
    return true
  } catch (error) {
    console.error("[v0] Integration test failed:", error.message)
    return false
  }
}

// Run tests if called directly
if (require.main === module) {
  testLoganeIntegration()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = { testLoganeIntegration }
