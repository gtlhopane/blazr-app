import { redirect } from "next/navigation"
import { appendFileSync } from "fs"

export default async function TrackPage({
  params,
}: {
  params: Promise<{ phone: string }>
}) {
  const { phone } = await params
  
  const logEntry = JSON.stringify({
    phone,
    source: "whatsapp-cta",
    timestamp: new Date().toISOString(),
  }) + "\n"
  
  try {
    appendFileSync("/home/node/.openclaw/workspace/blazr-click-log.jsonl", logEntry)
  } catch (e) {
    console.error("Log error:", e)
  }
  
  redirect("https://wholesale.blazr.africa?utm_source=whatsapp&utm_medium=cta&utm_campaign=blazr-outreach")
}
