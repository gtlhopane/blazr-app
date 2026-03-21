import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: prods, error: prodError } = await supabase
    .from("products")
    .select("*, categories(name, icon)")
    .eq("is_active", true)
    .limit(3)

  return Response.json({
    count: prods?.length ?? 0,
    error: prodError?.message ?? null,
    firstProduct: prods?.[0] ? {
      id: prods[0].id,
      name: prods[0].name,
      image_url: prods[0].image_url,
      keys: Object.keys(prods[0])
    } : null
  })
}
