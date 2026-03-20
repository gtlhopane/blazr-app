import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, FileText, Truck, Phone } from "lucide-react"

const STEPS = [
  {
    number: "01",
    icon: <FileText className="h-6 w-6" />,
    title: "Apply for an Account",
    description:
      "Submit your dispensary details through our secure application form. We verify your license and business registration. Applications are reviewed within 24 hours.",
    detail: "You'll need: Business registration, cannabis license, contact details, and intended order volume.",
  },
  {
    number: "02",
    icon: <CheckCircle className="h-6 w-6" />,
    title: "Get Approved",
    description:
      "Once verified, you receive full access to your buyer dashboard, custom pricing tiers, and your account manager's direct contact.",
    detail: "Approval typically takes under 24 hours. You'll get an email and WhatsApp confirmation.",
  },
  {
    number: "03",
    icon: <Phone className="h-6 w-6" />,
    title: "Order via Dashboard or WhatsApp",
    description:
      "Browse the live catalogue, add products to your cart, and submit orders directly through your dashboard. Alternatively, message us on WhatsApp with your order.",
    detail: "Minimum order quantities apply per product. Volume discounts available.",
  },
  {
    number: "04",
    icon: <Truck className="h-6 w-6" />,
    title: "Receive Delivery",
    description:
      "We deliver nationwide via secure courier. All orders are discreetly packaged and include lab reports. Real-time tracking on every shipment.",
    detail: "Delivery times vary by location. Typical lead time is 2–5 business days.",
  },
]

const REQS = [
  "Valid South African business registration (CIPC)",
  "Valid cannabis cultivation or dispensary license",
  "Physical dispensing premises",
  "Age verification processes in place",
  "Compliance with local municipal bylaws",
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-slate-800/40 bg-gradient-to-b from-[#0b1628]/80 to-transparent py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20 text-xs">Process</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              How It Works
            </h1>
            <p className="text-slate-400 text-lg">
              From application to delivery — a clear, transparent process built for dispensaries.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-2">
          {STEPS.map((step) => (
            <Card key={step.number} className="card-surface relative overflow-hidden">
              <CardContent className="p-8">
                <div className="absolute -right-4 -top-4 text-8xl font-black text-green-500/5 select-none">
                  {step.number}
                </div>
                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/5 text-green-400">
                    {step.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                  <p className="mb-3 text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  <p className="text-xs text-slate-500 border-t border-slate-800/50 pt-3">{step.detail}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Requirements */}
        <div className="mt-16 rounded-2xl border border-slate-800/60 bg-[#0f172a]/50 p-8">
          <h2 className="mb-6 text-2xl font-semibold">Account Requirements</h2>
          <p className="mb-6 text-sm text-slate-400">
            To open a wholesale account, your business must meet the following criteria:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {REQS.map((req) => (
              <div key={req} className="flex items-start gap-2.5">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                <span className="text-sm text-slate-300">{req}</span>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/apply">
              <Button className="bg-green-600 hover:bg-green-500 text-white font-medium">
                Start Application
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
