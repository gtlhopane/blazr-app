import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CheckCircle, Shield, Package, Truck } from "lucide-react"

const FEATURES = [
  {
    icon: <Shield className="h-5 w-5 text-green-400" />,
    title: "Licensed & Verified",
    desc: "Every buyer is verified. Every product is lab-tested. Full compliance with SA regulations.",
  },
  {
    icon: <Package className="h-5 w-5 text-green-400" />,
    title: "Premium Products",
    desc: "Greenhouse, indoor, concentrates, edibles and more — all sourced from vetted cultivators.",
  },
  {
    icon: <Truck className="h-5 w-5 text-green-400" />,
    title: "Nationwide Delivery",
    desc: "Secure, discreet delivery across South Africa. Track your orders in real time.",
  },
]

const CATEGORIES = [
  { name: "Flower", icon: "🌿", count: "Greenhouse & Indoor" },
  { name: "Edibles", icon: "🍬", count: "Gummies, chocolates & more" },
  { name: "Vapes", icon: "💨", count: "Disposable & cartridge pens" },
  { name: "Concentrates", icon: "💎", count: "Rosin, hash, shatter" },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-28 md:py-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(34,197,94,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,_rgba(34,197,94,0.04),transparent)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-green-500/10 text-green-400 border-green-500/20 px-4 py-1 text-xs font-medium tracking-wider uppercase">
              South Africa&apos;s Premier B2B Cannabis Platform
            </Badge>

            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl leading-tight">
              Wholesale cannabis,{" "}
              <span className="gradient-text">engineered for</span>
              <br />
              dispensaries
            </h1>

            <p className="mx-auto mb-10 max-w-xl text-lg text-slate-400 leading-relaxed">
              Consistent supply. Transparent pricing. Lab-tested products from licensed cultivators.
              Built for dispensaries who need reliability, not excuses.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/apply">
                <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white text-base px-8 h-12 font-semibold gap-2">
                  Apply for Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/catalogue">
                <Button size="lg" variant="outline" className="text-base px-8 h-12 border-slate-700 text-slate-300 hover:bg-slate-900/50 hover:text-white">
                  Browse Catalogue
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-8 text-sm text-slate-500">
              {["Licensed Platform", "Lab Tested", "Nationwide"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-slate-800/40 bg-[#0b1628]/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Card key={cat.name} className="card-surface glow-green-hover transition-all duration-300 cursor-pointer hover:border-green-500/20">
                <CardContent className="flex items-center gap-4 p-5">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{cat.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{cat.count}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for serious buyers
            </h2>
            <p className="mt-3 text-slate-400">
              No brokers. No shortcuts. Just a direct line from cultivator to your shelf.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/5">
                  {f.icon}
                </div>
                <div>
                  <h3 className="mb-1.5 font-semibold">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Star product */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <Badge className="mb-3 bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                ⭐ Featured Product
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Gummies-in-a-Jar</h2>
            </div>
            <Link href="/catalogue">
              <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 gap-1.5">
                Full catalogue <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-green-500/15 bg-gradient-to-br from-[#052e16]/40 via-[#0f172a] to-[#020b18] p-8 md:p-12">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-green-500/10 blur-3xl" />
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="mb-4 text-6xl">🫙</div>
                <h3 className="mb-2 text-2xl font-bold">Gummies-in-a-Jar</h3>
                <p className="mb-5 max-w-lg text-slate-400 text-sm leading-relaxed">
                  Our bestseller. Bulk gummies sold by the piece in a resealable jar. Perfect for
                  dispensaries that want flexibility and value. Consistent 10mg dosing per gummy.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-green-400">R13</span>
                    <span className="text-slate-400 text-sm">/gummy</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-1 border border-slate-800">
                    <span className="text-xs text-slate-400">MOQ:</span>
                    <span className="text-sm font-medium">50 units</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-1 border border-slate-800">
                    <span className="text-xs text-slate-400">Pack sizes:</span>
                    <span className="text-sm font-medium">50 / 100</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Link href="/apply">
                  <Button className="bg-green-600 hover:bg-green-500 text-white font-semibold px-6 h-11 gap-2">
                    Order via WhatsApp <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works preview */}
      <section className="border-t border-slate-800/40 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-3 text-slate-400">Three steps to start ordering.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Apply for Access", desc: "Submit your dispensary details. We verify licensing before approval." },
              { step: "02", title: "Browse & Order", desc: "Access the full catalogue with your approved pricing. Order via the dashboard." },
              { step: "03", title: "Receive Delivery", desc: "We deliver nationwide. All products come with lab reports and COAs." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mb-4 text-6xl font-black text-green-500/10 tracking-tight">{item.step}</div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/how-it-works">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-900/50 hover:text-white gap-2">
                Learn more <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-800/40 py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to stock your dispensary?
          </h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto">
            Apply for a wholesale account. We review applications within 24 hours.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/apply">
              <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white text-base px-8 h-12 font-semibold gap-2">
                Apply for Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-base px-8 h-12 border-slate-700 text-slate-300 hover:bg-slate-900/50 hover:text-white">
                Talk to Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
