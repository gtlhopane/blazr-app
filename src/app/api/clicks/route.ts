import { NextResponse } from "next/server"
import { readFileSync } from "fs"

export async function GET() {
  try {
    const logFile = "/home/node/.openclaw/workspace/blazr-click-log.jsonl"
    const content = readFileSync(logFile, "utf-8")
    const lines = content.trim().split("\n").filter(Boolean).map(l => JSON.parse(l))
    
    // Summary
    const byDate: Record<string, number> = {}
    const uniquePhones = new Set<string>()
    
    for (const entry of lines) {
      const date = entry.timestamp?.split("T")[0]
      if (date) byDate[date] = (byDate[date] || 0) + 1
      if (entry.phone) uniquePhones.add(entry.phone)
    }
    
    return NextResponse.json({
      total_clicks: lines.length,
      unique_phones: uniquePhones.size,
      by_date: byDate,
      recent: lines.slice(-10).reverse()
    })
  } catch (e) {
    return NextResponse.json({ total_clicks: 0, unique_phones: 0, by_date: {}, recent: [] })
  }
}
