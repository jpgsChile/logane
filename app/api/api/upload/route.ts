import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (!filename) {
      return NextResponse.json({ success: false, error: "Filename is required" }, { status: 400 })
    }

    const file = request.body
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({
      success: true,
      data: {
        url: blob.url,
        filename: filename,
      },
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 })
  }
}
