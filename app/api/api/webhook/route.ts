import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] Farcaster webhook received:", body)

    // Process different webhook events
    switch (body.type) {
      case "miniapp.install":
        // Handle Mini App installation
        console.log("Mini App instalada por usuario:", body.data.fid)
        break

      case "miniapp.uninstall":
        // Handle Mini App uninstallation
        console.log("Mini App desinstalada por usuario:", body.data.fid)
        break

      case "notification.click":
        // Handle notification clicks
        console.log("Notiticación aceptada por el usuario:", body.data.fid)
        break

      default:
        console.log("Webhook event type desconocido:", body.type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook proceso fallido" }, { status: 500 })
  }
}
