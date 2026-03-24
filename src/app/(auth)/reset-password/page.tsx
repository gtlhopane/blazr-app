"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [checking, setChecking] = useState(true)
  const [noToken, setNoToken] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
      // Check if we have a token in the URL hash or PKCE code in query params
      const hash = window.location.hash
      const search = window.location.search
      if (
        (!hash || !hash.includes("access_token")) &&
        (!search || !search.includes("code="))
      ) {
        setNoToken(true)
        setChecking(false)
        return
      }
      // Ensure client has fully initialized and parsed the URL hash / PKCE code
      const supabase = createClient()
      try {
        await supabase.auth.initialize()
      } catch (_) {}
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        setNoToken(true)
      }
      setChecking(false)
    }
    checkSession()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    const supabase = createClient()

    // Ensure URL hash / PKCE code has been processed before updateUser call
    try {
      await supabase.auth.initialize()
    } catch (_) {}

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (noToken) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 text-4xl">🔗</div>
          <h1 className="text-xl font-bold mb-2">Invalid Reset Link</h1>
          <p className="text-slate-400 text-sm mb-6">
            This password reset link has expired or is invalid. Please request a new one.
          </p>
          <Link href="/forgot-password">
            <Button className="bg-green-600 hover:bg-green-500 text-white">
              Request New Link
            </Button>
          </Link>
          <div className="mt-4">
            <Link href="/login" className="text-sm text-slate-400 hover:text-green-400">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/5">
            <span className="text-xl font-bold text-green-400">B</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {done ? "Password Updated" : "Set New Password"}
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            {done
              ? "Your password has been changed successfully."
              : "Choose a strong password to secure your account."}
          </p>
        </div>

        <Card className="card-surface">
          <CardContent className="p-6">
            {done ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-sm text-slate-400">
                  You can now sign in with your new password.
                </p>
                <Link href="/login">
                  <Button className="w-full bg-green-600 hover:bg-green-500 text-white mt-2">
                    Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs text-slate-400">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="border-slate-700 bg-slate-900/50 h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs text-slate-400">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="border-slate-700 bg-slate-900/50 h-10"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-medium h-10"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save New Password"}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-slate-400 hover:text-green-400"
                  >
                    Cancel
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
