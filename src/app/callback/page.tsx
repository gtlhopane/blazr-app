"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function CallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Supabase handles the token exchange from the URL hash
    // This runs automatically and sets the session cookie
    supabase.auth.getUser().then(({ user, error }) => {
      if (error) {
        toast.error("Email confirmation failed: " + error.message)
        router.push("/login")
      } else if (user) {
        toast.success("Email confirmed! You're now logged in.")
        router.push("/checkout")
      } else {
        // No user yet — wait a moment for session to be established
        setTimeout(() => {
          router.push("/checkout")
        }, 1500)
      }
    })
  }, [router, supabase])

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-3xl">✅</div>
        <h2 className="text-xl font-bold text-white mb-2">Confirming your email...</h2>
        <p className="text-slate-400 text-sm">You'll be redirected shortly.</p>
      </div>
    </div>
  )
}
