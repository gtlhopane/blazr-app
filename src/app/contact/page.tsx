import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Mail, Clock } from "lucide-react"

const WHATSAPP = "27663249083"

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-slate-800/40 bg-gradient-to-b from-[#0b1628]/80 to-transparent py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20 text-xs">Contact</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Get in Touch
            </h1>
            <p className="text-slate-400 text-lg">
              Questions about wholesale pricing, product availability, or your order? We&apos;re here.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="card-surface">
              <CardHeader>
                <CardTitle className="text-xl">Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="grid gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Your name" className="border-slate-700 bg-slate-900/50" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@business.co.za" className="border-slate-700 bg-slate-900/50" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Order inquiry, account question..." className="border-slate-700 bg-slate-900/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" rows={5} placeholder="How can we help?" className="border-slate-700 bg-slate-900/50 resize-none" />
                  </div>
                  <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-medium">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="card-surface">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/5">
                    <MessageCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-sm">WhatsApp</h3>
                    <p className="text-sm text-slate-400 mb-3">Fastest response — typically under 2 hours.</p>
                    <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-green-600 hover:bg-green-500 text-white gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Chat Now
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-surface">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-sm">Email</h3>
                    <p className="text-sm text-green-400">orders@blazr.africa</p>
                    <p className="text-sm text-slate-500">accounts@blazr.africa</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-surface">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50">
                    <Clock className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-sm">Response Time</h3>
                    <p className="text-sm text-slate-400">Mon–Fri: 08:00 – 17:00 SAST</p>
                    <p className="text-sm text-slate-500">WhatsApp: fastest</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
