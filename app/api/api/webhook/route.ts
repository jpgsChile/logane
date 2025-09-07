import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] Farcaster webhook received:", body)

    // Process different webhook events
    switch (body.type) {
      case "miniapp.install":
        // Handle Mini App installation
        console.log("[v0] Mini App installed by user:", body.data.fid)
        break

      case "miniapp.uninstall":
        // Handle Mini App uninstallation
        console.log("[v0] Mini App uninstalled by user:", body.data.fid)
        break

      case "notification.click":
        // Handle notification clicks
        console.log("[v0] Notification clicked by user:", body.data.fid)
        break

      default:
        console.log("[v0] Unknown webhook event type:", body.type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
