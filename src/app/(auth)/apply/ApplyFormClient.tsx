"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const STEPS = [
  "Business Details",
  "Contact Information",
  "Create Account",
]

export default function ApplyFormClient() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams() ?? new URLSearchParams()

  // Pre-fill order from catalogue tier selection
  const prefillProduct = searchParams.get("product") || ""
  const prefillQty = searchParams.get("qty") || ""
  const prefillPrice = searchParams.get("price") || ""
  const hasOrderPrefill = !!(prefillProduct && prefillQty && prefillPrice)

  const [form, setForm] = useState({
    businessName: "",
    registrationNumber: "",
    address: "",
    city: "",
    province: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    intent: "",
    volume: prefillQty ? `${prefillQty} units` : "",
    password: "",
    confirmPassword: "",
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step < 2) {
      setStep((s) => s + 1)
      return
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.contactEmail,
      password: form.password,
      options: { data: { full_name: form.contactName } },
    })

    if (signUpError || !authData.user) {
      toast.error(signUpError?.message || "Registration failed")
      setLoading(false)
      return
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: form.businessName,
        registration_number: form.registrationNumber,
        address: form.address,
        city: form.city,
        province: form.province,
      })
      .select()
      .single()

    if (companyError) {
      toast.warning("Account created but company details not saved. Contact us.")
    }

    const { error: appError } = await supabase.from("buyer_applications").insert({
      user_id: authData.user.id,
      company_id: company?.id,
      contact_name: form.contactName,
      contact_email: form.contactEmail,
      contact_phone: form.contactPhone,
      intent_description: form.intent,
      expected_volume: form.volume,
      status: "pending",
    })

    if (appError) {
      toast.error("Application submitted but there was an issue. Please contact us.")
    } else {
      toast.success("Application submitted! We'll review within 24 hours.")
    }

    setLoading(false)
    router.push("/login")
  }

  return (
    <div className="min-h-screen py-16">
      <div className="mx-auto max-w-xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge className="mb-3 bg-green-500/10 text-green-400 border-green-500/20 text-xs">Wholesale Application</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Apply for an Account</h1>
          <p className="mt-2 text-sm text-slate-400">
            Complete the form below. We verify all applications within 24 hours.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                i <= step ? "bg-green-600 text-white" : "border border-slate-700 text-slate-500"
              }`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`hidden text-xs sm:inline ${i <= step ? "text-slate-200" : "text-slate-600"}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 sm:w-12 ${i < step ? "bg-green-600" : "bg-slate-800"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Order summary from catalogue tier selection */}
        {hasOrderPrefill && (
          <div className="mb-6 rounded-xl border border-[#FAD03F]/30 bg-[#FAD03F]/5 p-4">
            <p className="text-xs font-medium text-[#FAD03F] mb-1">Order Selection</p>
            <p className="text-sm text-slate-200 font-semibold">{prefillQty} × {decodeURIComponent(prefillProduct)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total: R{Number(prefillPrice) / 100}</p>
          </div>
        )}

        <Card className="card-surface">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 0 && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input id="businessName" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} required className="border-slate-700 bg-slate-900/50 h-10" placeholder="Green Leaf Dispensary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="registrationNumber">CIPC Registration Number</Label>
                    <Input id="registrationNumber" value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} className="border-slate-700 bg-slate-900/50 h-10" placeholder="2021/123456/07" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address">Business Address</Label>
                    <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} className="border-slate-700 bg-slate-900/50 h-10" placeholder="123 Main Street" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} className="border-slate-700 bg-slate-900/50 h-10" placeholder="Johannesburg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="province">Province</Label>
                      <Input id="province" value={form.province} onChange={(e) => update("province", e.target.value)} className="border-slate-700 bg-slate-900/50 h-10" placeholder="Gauteng" />
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactName">Contact Person Name</Label>
                    <Input id="contactName" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} required className="border-slate-700 bg-slate-900/50 h-10" placeholder="Jane Smith" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactEmail">Business Email</Label>
                    <Input id="contactEmail" type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} required className="border-slate-700 bg-slate-900/50 h-10" placeholder="jane@greenleaf.co.za" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactPhone">Phone / WhatsApp</Label>
                    <Input id="contactPhone" type="tel" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} required className="border-slate-700 bg-slate-900/50 h-10" placeholder="+27 61 234 5678" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="intent">What do you intend to order?</Label>
                    <Textarea id="intent" value={form.intent} onChange={(e) => update("intent", e.target.value)} className="border-slate-700 bg-slate-900/50 resize-none" rows={3} placeholder="Flower, edibles, concentrates..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="volume">Expected Monthly Volume</Label>
                    <Input id="volume" value={form.volume} onChange={(e) => update("volume", e.target.value)} className="border-slate-700 bg-slate-900/50 h-10" placeholder="e.g. 500g flower, 100 vape pens" />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-4 text-sm text-slate-400">
                    <p className="font-medium text-slate-200 mb-2">Review your application</p>
                    <p><strong className="text-slate-300">{form.businessName}</strong> — {form.city}, {form.province}</p>
                    <p>Applicant: {form.contactName} ({form.contactEmail})</p>
                    <Separator className="my-3 bg-slate-800" />
                    <p className="text-xs">If this looks correct, create your account password below to submit.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Account Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPw ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                        required
                        minLength={8}
                        className="border-slate-700 bg-slate-900/50 h-10 pr-10"
                        placeholder="Min. 8 characters"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      required
                      className="border-slate-700 bg-slate-900/50 h-10"
                      placeholder="Repeat password"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} className="border-slate-700 text-slate-300 h-10">
                    Back
                  </Button>
                )}
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium h-10" disabled={loading}>
                  {loading ? "Submitting..." : step < 2 ? "Continue" : "Submit Application"}
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-green-400 hover:text-green-300">Sign in</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
