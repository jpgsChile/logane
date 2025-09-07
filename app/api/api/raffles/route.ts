import { type NextRequest, NextResponse } from "next/server"
import { blockchainService } from "@/lib/blockchain"
import type { CreateRaffleRequest, RaffleResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get("user")
    const status = searchParams.get("status") // 'active', 'ended', 'all'

    if (userAddress) {
      // Get user's raffles
      const userRaffleIds = await blockchainService.getUserRaffles(userAddress)
      const userRaffles = await Promise.all(userRaffleIds.map((id) => blockchainService.getRaffle(id)))

      const response: RaffleResponse = {
        success: true,
        data: userRaffles.filter((raffle) => raffle !== null),
      }
      return NextResponse.json(response)
    }

    // Get all active raffles by default
    const raffles = await blockchainService.getActiveRaffles()

    const response: RaffleResponse = {
      success: true,
      data: raffles,
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in GET /api/raffles:", error)
    const response: RaffleResponse = {
      success: false,
      error: "Failed to fetch raffles",
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateRaffleRequest = await request.json()

    // Validate request body
    if (!body.title || !body.description || !body.prizes || body.prizes.length !== 3) {
      const response: RaffleResponse = {
        success: false,
        error: "Invalid raffle data",
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Return transaction data for frontend to execute
    const response: RaffleResponse = {
      success: true,
      data: {
        message: "Raffle data validated. Use this data to create transaction.",
        raffleData: body,
      },
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in POST /api/raffles:", error)
    const response: RaffleResponse = {
      success: false,
      error: "Failed to process raffle creation",
    }
    return NextResponse.json(response, { status: 500 })
  }
}
