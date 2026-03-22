import { Suspense } from "react"
import ApplyFormClient from "./ApplyFormClient"

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>}>
      <ApplyFormClient />
    </Suspense>
  )
}
