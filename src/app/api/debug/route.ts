import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const admin = createSupabaseAdmin()
    const { data, error } = await admin.from("orders").select("id").limit(1)
    return NextResponse.json({ 
      env: {
        SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        SERVICE_KEY_PREFIX: (process.env.SUPABASE_SERVICE_ROLE_KEY || "").substring(0, 20),
      },
      supabaseError: error,
      orders: data
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
