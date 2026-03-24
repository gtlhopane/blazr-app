"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/5">
            <span className="text-xl font-bold text-green-400">B</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            {sent
              ? "Check your inbox"
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <Card className="card-surface">
          <CardContent className="p-6">
            {sent ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <span className="text-2xl">📧</span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">
                    We sent a password reset link to{" "}
                    <span className="text-white font-medium">{email}</span>
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  Didn't get it? Check your spam folder, or{" "}
                  <button
                    onClick={() => { setSent(false); setLoading(false) }}
                    className="text-green-400 hover:text-green-300"
                  >
                    try again
                  </button>
                  .
                </p>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full mt-2 border-slate-700 text-slate-300"
                  >
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs text-slate-400">
                    Email address
                  </Label>
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

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-medium h-10"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center text-sm text-slate-400">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-green-400 hover:text-green-300 font-medium"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
