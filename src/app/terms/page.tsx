import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { FileText, Download } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-[#2a2a2a] bg-gradient-to-b from-[#111]/80 to-transparent py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-[#FAD03F]/10 text-[#FAD03F] border-[#FAD03F]/20 text-xs">Legal</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Terms & Conditions
          </h1>
          <p className="text-[#888] text-lg max-w-2xl">
            These terms govern your use of the Blazr Wholesale platform. By registering or placing
            an order, you agree to be bound by these terms.
          </p>
          <p className="mt-3 text-sm text-[#666]">
            Last updated: April 2025
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8 text-sm leading-relaxed text-[#cccccc]">

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Section A — Member Users (Customers)</h2>
              <p className="mb-3">
                By registering you will become a member of the Club and agree to abide by the terms and
                conditions as determined by the Club.
              </p>
              <p className="mb-3">
                Members of our private and exclusive Club who have been vetted as adults are able to enjoy
                the beneficial effects of cannabis, legally and as responsible adults in a private space
                as determined by The Cannabis for Private Purposes Act No 7 of 2024.
              </p>
              <p>
                The privacy of the club and the exclusive services afforded to Club members ensures
                compliance with the law on restricted access to private space and usage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Membership Eligibility</h2>
              <p className="mb-3">
                The Member is an adult major who is fully cognizant of the responsible use of cannabis
                and undertakes to observe the Rules of the Club as set out herein.
              </p>
              <p>
                Accordingly the Member indemnifies the Club and its managers from any liability arising
                out of abuse of cannabis by the Member.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Order & Delivery</h2>
              <p className="mb-3">
                All orders are subject to verification of membership status before fulfillment. HQ will
                pack and dispatch orders within the agreed lead time. Delivery is handled by vetted
                drivers who collect and scan packages before delivery to verified members.
              </p>
              <p>
                Members must confirm receipt via the QR code system. The system logs delivery and
                closes the order upon confirmation. Risk in goods passes to the Member upon delivery
                and confirmation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Pricing & Payment</h2>
              <p className="mb-3">
                All prices are exclusive of VAT unless stated. Wholesale pricing is available to approved
                accounts only. Volume discounts may apply subject to agreement. Payment terms are as
                agreed between the parties in writing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Limitation of Liability</h2>
              <p>
                Blazr Wholesale and its affiliates shall not be liable for any indirect, incidental, or
                consequential damages arising from the use of the platform or products supplied. The
                Member indemnifies the Club from any liability arising from misuse of cannabis products.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Governing Law</h2>
              <p>
                These terms are governed by the laws of the Republic of South Africa. Any disputes
                shall be subject to the exclusive jurisdiction of the South African courts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">POPIA Compliance</h2>
              <p>
                By joining as a member, you consent to Blazr processing your personal information in
                accordance with the Protection of Personal Information Act (POPIA). See our full
                Privacy Policy for details on data collection, storage, and your rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Platform Access</h2>
              <p className="mb-3">
                Access to the Blazr Wholesale platform is restricted to licensed dispensaries and verified
                members. Unauthorized access or sharing of credentials is strictly prohibited.
              </p>
              <p>
                Blazr reserves the right to suspend or terminate accounts that violate these terms or
                applicable South African law.
              </p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="card-surface">
              <CardContent className="p-5">
                <h3 className="font-semibold text-sm mb-4 text-white">Related Documents</h3>
                <div className="space-y-3">
                  <Link href="/privacy" className="flex items-center gap-3 text-sm text-[#888] hover:text-[#FAD03F] transition">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span>Privacy Policy (POPIA)</span>
                  </Link>
                  <a href="/docs/blazr-terms.pdf" className="flex items-center gap-3 text-sm text-[#888] hover:text-[#FAD03F] transition">
                    <Download className="h-4 w-4 flex-shrink-0" />
                    <span>Download Full Terms (PDF)</span>
                  </a>
                  <a href="/docs/popia.pdf" className="flex items-center gap-3 text-sm text-[#888] hover:text-[#FAD03F] transition">
                    <Download className="h-4 w-4 flex-shrink-0" />
                    <span>POPIA Policy (PDF)</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="card-surface border-[#FAD03F]/20">
              <CardContent className="p-5">
                <h3 className="font-semibold text-sm mb-2 text-[#FAD03F]">Questions?</h3>
                <p className="text-xs text-[#888] mb-3">
                  Contact our compliance team for any queries about these terms.
                </p>
                <a href="mailto:legal@blazr.africa" className="text-xs text-[#FAD03F] hover:underline">
                  legal@blazr.africa
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
