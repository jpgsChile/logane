import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fid, message, actionUrl } = body

    console.log("[v0] Sending notification to FID:", fid)

    // Here you would integrate with Farcaster's notification system
    // For now, we'll just log the notification
    console.log("[v0] Notification:", { fid, message, actionUrl })

    return NextResponse.json({
      success: true,
      notificationId: `notif_${Date.now()}`,
    })
  } catch (error) {
    console.error("[v0] Notification error:", error)
    return NextResponse.json({ error: "Notification sending failed" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    enabled: true,
    types: ["raffle_created", "raffle_won", "raffle_ending_soon"],
  })
}
