import { NextResponse } from "next/server"
import { blockchainService } from "@/lib/blockchain"

export async function GET() {
  try {
    // Test blockchain connection
    const testRaffle = await blockchainService.getRaffle(1)

    return NextResponse.json({
      success: true,
      data: {
        status: "healthy",
        blockchain: "connected",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: {
          status: "unhealthy",
          blockchain: "disconnected",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}
