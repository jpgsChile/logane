import { type NextRequest, NextResponse } from "next/server"
import { blockchainService } from "@/lib/blockchain"
import type { RaffleResponse } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const raffleId = Number.parseInt(params.id)

    if (isNaN(raffleId)) {
      const response: RaffleResponse = {
        success: false,
        error: "Invalid raffle ID",
      }
      return NextResponse.json(response, { status: 400 })
    }

    const raffle = await blockchainService.getRaffle(raffleId)

    if (!raffle) {
      const response: RaffleResponse = {
        success: false,
        error: "Raffle not found",
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: RaffleResponse = {
      success: true,
      data: raffle,
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in GET /api/raffles/[id]:", error)
    const response: RaffleResponse = {
      success: false,
      error: "Failed to fetch raffle",
    }
    return NextResponse.json(response, { status: 500 })
  }
}
