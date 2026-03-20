import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const body = await req.json()
    
    // Validate required fields
    if (!body.name || !body.wholesale_price || !body.moq || !body.unit || !body.category_id) {
      return NextResponse.json(
        { error: "Missing required fields: name, wholesale_price, moq, unit, category_id" },
        { status: 400 }
      )
    }
    
    const product = {
      name: body.name,
      description: body.description || null,
      wholesale_price: Number(body.wholesale_price),
      moq: Number(body.moq),
      unit: body.unit,
      category_id: body.category_id,
      is_featured: body.is_featured || false,
      is_active: body.is_active !== false,
    }
    
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    
    let query = supabase
      .from("products")
      .select("*, categories(name, icon)")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
    
    if (category) {
      query = query.eq("categories.name", category)
    }
    
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
