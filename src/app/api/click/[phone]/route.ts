import { NextRequest, NextResponse } from "next/server"
import { appendFileSync, existsSync } from "fs"
import { join } from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const { phone } = await params

  const logEntry = {
    phone,
    source: "whatsapp-cta",
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") || "",
  }

  try {
    const logFile = "/home/node/.openclaw/workspace/blazr-click-log.jsonl"
    appendFileSync(logFile, JSON.stringify(logEntry) + "\n")
  } catch (e) {
    console.error("Failed to write click log:", e)
  }

  // Redirect to wholesale site
  return NextResponse.redirect(
    new URL("https://wholesale.blazr.africa?utm_source=whatsapp&utm_medium=cta&utm_campaign=blazr-outreach"),
    { status: 302 }
  )
}
