import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Scale, Globe } from "lucide-react"

const VALUES = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Compliance First",
    desc: "Every product in our catalogue meets SA regulatory standards. We only work with licensed operators across the supply chain.",
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: "Transparent Pricing",
    desc: "No hidden fees. No middlemen. You see exactly what you pay, down to the gram. Volume tiers are clear and consistent.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "National Reach",
    desc: "From Cape Town to Limpopo, we deliver. Our logistics network covers every major metro and most rural areas.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-slate-800/40 bg-gradient-to-b from-[#0b1628]/80 to-transparent py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20 text-xs">About Us</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Who We Are
            </h1>
            <p className="text-slate-400 text-lg">
              Blazr Wholesale is South Africa&apos;s B2B cannabis platform built for dispensaries who value reliability,
              compliance, and competitive pricing.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Mission */}
        <div className="mb-20 grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Our Mission</h2>
            <p className="mb-4 text-slate-400 leading-relaxed">
              We built Blazr because the cannabis supply chain in South Africa was broken. Dispensaries were
              overpaying, dealing with inconsistent quality, and navigating a fragmented market with no
              clear wholesale partner.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Blazr is the platform that fixes that. A centralized wholesale marketplace where dispensaries
              can source from vetted cultivators and manufacturers — with full price transparency, compliance
              documentation, and reliable logistics.
            </p>
          </div>
          <div className="relative rounded-2xl border border-slate-800/60 bg-[#0f172a]/50 p-8">
            <div className="absolute -right-4 -top-4 text-6xl opacity-10">⚡</div>
            <blockquote className="text-lg font-medium leading-relaxed text-slate-200">
              &ldquo;We don&apos;t move product. We move an industry forward.&rdquo;
            </blockquote>
            <p className="mt-4 text-sm text-slate-500">— Blazr Wholesale, 2024</p>
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="mb-8 text-2xl font-semibold">What We Stand For</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <Card key={v.title} className="card-surface">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/5 text-green-400">
                    {v.icon}
                  </div>
                  <h3 className="mb-2 font-semibold">{v.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
