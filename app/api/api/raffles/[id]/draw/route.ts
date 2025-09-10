import { type NextRequest, NextResponse } from "next/server"
import { blockchainService } from "@/lib/blockchain"
import type { RaffleResponse } from "@/lib/types"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const raffleId = Number.parseInt(params.id)

    if (isNaN(raffleId)) {
      const response: RaffleResponse = {
        success: false,
        error: "Invalid raffle ID",
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

    // Check if raffle can be drawn
    if (!raffle.isActive) {
      const response: RaffleResponse = {
        success: false,
        error: "Raffle is not active",
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (raffle.endTime > Date.now() / 1000) {
      const response: RaffleResponse = {
        success: false,
        error: "Raffle has not ended yet",
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (raffle.isDrawn) {
      const response: RaffleResponse = {
        success: false,
        error: "Winners already drawn",
      }
      return NextResponse.json(response, { status: 400 })
    }

    if (raffle.participants.length === 0) {
      const response: RaffleResponse = {
        success: false,
        error: "No participants in raffle",
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Return transaction data for frontend to execute
    const response: RaffleResponse = {
      success: true,
      data: {
        message: "Ready to draw winners. Use this data to create transaction.",
        raffleId,
        participantCount: raffle.participants.length,
      },
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in POST /api/raffles/[id]/draw:", error)
    const response: RaffleResponse = {
      success: false,
      error: "Failed to process draw",
    }
    return NextResponse.json(response, { status: 500 })
  }
}
