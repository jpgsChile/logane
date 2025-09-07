import { type NextRequest, NextResponse } from "next/server"
import { blockchainService } from "@/lib/blockchain"
import type { RaffleResponse } from "@/lib/types"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const raffleId = Number.parseInt(params.id)
    const { userAddress } = await request.json()

    if (isNaN(raffleId) || !userAddress) {
      const response: RaffleResponse = {
        success: false,
        error: "Invalid raffle ID or user address",
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Get raffle details
    const raffle = await blockchainService.getRaffle(raffleId)

    if (!raffle) {
      const response: RaffleResponse = {
        success: false,
        error: "Raffle not found",
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Check if raffle is still active
    if (!raffle.isActive || raffle.endTime <= Date.now() / 1000) {
      const response: RaffleResponse = {
        success: false,
        error: "Raffle is no longer active",
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Check if user already participated
    const hasParticipated = await blockchainService.hasUserParticipated(raffleId, userAddress)
    if (hasParticipated) {
      const response: RaffleResponse = {
        success: false,
        error: "User already participated in this raffle",
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Check if raffle is full
    if (raffle.participants.length >= raffle.maxParticipants) {
      const response: RaffleResponse = {
        success: false,
        error: "Raffle is full",
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Return transaction data for frontend to execute
    const response: RaffleResponse = {
      success: true,
      data: {
        message: "Ready to participate. Use this data to create transaction.",
        raffleId,
        ticketPrice: raffle.ticketPrice,
        userAddress,
      },
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in POST /api/raffles/[id]/participate:", error)
    const response: RaffleResponse = {
      success: false,
      error: "Failed to process participation",
    }
    return NextResponse.json(response, { status: 500 })
  }
}
