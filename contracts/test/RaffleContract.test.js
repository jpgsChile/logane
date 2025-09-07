const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("RaffleContract", () => {
  let raffleContract
  let owner
  let feeRecipient
  let user1
  let user2
  let user3

  beforeEach(async () => {
    ;[owner, feeRecipient, user1, user2, user3] = await ethers.getSigners()

    const RaffleContract = await ethers.getContractFactory("RaffleContract")
    raffleContract = await RaffleContract.deploy(feeRecipient.address)
    await raffleContract.deployed()
  })

  describe("Raffle Creation", () => {
    it("Should create a raffle successfully", async () => {
      const prizes = [
        {
          name: "First Prize",
          description: "iPhone 15",
          imageUrl: "https://example.com/iphone.jpg",
          value: ethers.utils.parseEther("1"),
        },
        {
          name: "Second Prize",
          description: "AirPods",
          imageUrl: "https://example.com/airpods.jpg",
          value: ethers.utils.parseEther("0.3"),
        },
        {
          name: "Third Prize",
          description: "Gift Card",
          imageUrl: "https://example.com/giftcard.jpg",
          value: ethers.utils.parseEther("0.1"),
        },
      ]

      const ticketPrice = ethers.utils.parseEther("0.01")
      const maxParticipants = 100
      const duration = 86400 // 1 day

      await expect(
        raffleContract.createRaffle("Test Raffle", "A test raffle", prizes, ticketPrice, maxParticipants, duration),
      ).to.emit(raffleContract, "RaffleCreated")

      const raffle = await raffleContract.getRaffle(1)
      expect(raffle.title).to.equal("Test Raffle")
      expect(raffle.ticketPrice).to.equal(ticketPrice)
      expect(raffle.maxParticipants).to.equal(maxParticipants)
    })
  })

  describe("Raffle Participation", () => {
    beforeEach(async () => {
      const prizes = [
        {
          name: "First Prize",
          description: "iPhone 15",
          imageUrl: "https://example.com/iphone.jpg",
          value: ethers.utils.parseEther("1"),
        },
        {
          name: "Second Prize",
          description: "AirPods",
          imageUrl: "https://example.com/airpods.jpg",
          value: ethers.utils.parseEther("0.3"),
        },
        {
          name: "Third Prize",
          description: "Gift Card",
          imageUrl: "https://example.com/giftcard.jpg",
          value: ethers.utils.parseEther("0.1"),
        },
      ]

      await raffleContract.createRaffle(
        "Test Raffle",
        "A test raffle",
        prizes,
        ethers.utils.parseEther("0.01"),
        100,
        86400,
      )
    })

    it("Should allow users to join raffle", async () => {
      const ticketPrice = ethers.utils.parseEther("0.01")

      await expect(raffleContract.connect(user1).joinRaffle(1, { value: ticketPrice })).to.emit(
        raffleContract,
        "ParticipantJoined",
      )

      const participantCount = await raffleContract.getParticipantCount(1)
      expect(participantCount).to.equal(1)
    })

    it("Should not allow duplicate participation", async () => {
      const ticketPrice = ethers.utils.parseEther("0.01")

      await raffleContract.connect(user1).joinRaffle(1, { value: ticketPrice })

      await expect(raffleContract.connect(user1).joinRaffle(1, { value: ticketPrice })).to.be.revertedWith(
        "Already participated",
      )
    })
  })
})
