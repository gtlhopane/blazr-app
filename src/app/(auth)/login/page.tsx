"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useCart } from "@/contexts/CartContext"

function LoginPageContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loadCartFromSupabase } = useCart()
  const returnTo = searchParams.get("returnTo") || "/checkout"

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success("Welcome back!")
      if (data.user) {
        await loadCartFromSupabase(data.user.id)
      }
      router.push(returnTo)
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/5">
            <span className="text-xl font-bold text-green-400">B</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sign In</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Access your wholesale account
          </p>
        </div>

        <Card className="card-surface">
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-slate-400">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@dispensary.co.za"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-slate-700 bg-slate-900/50 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs text-slate-400">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-green-400 hover:text-green-300">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-slate-700 bg-slate-900/50 h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-white font-medium h-10"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/apply" className="text-green-400 hover:text-green-300 font-medium">
                Apply for access
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Wrapper with CartProvider for SSR safety
export default function LoginPage() {
  return (
    <CartProvider>
      <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center"><div className="text-slate-400">Loading...</div></div>}>
        <LoginPageContent />
      </Suspense>
    </CartProvider>
  )
}
