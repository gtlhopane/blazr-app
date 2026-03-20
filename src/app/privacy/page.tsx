import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { FileText } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-[#2a2a2a] bg-gradient-to-b from-[#111]/80 to-transparent py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-[#FAD03F]/10 text-[#FAD03F] border-[#FAD03F]/20 text-xs">Legal</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Privacy Policy
          </h1>
          <p className="text-[#888] text-lg max-w-2xl">
            How we collect, use, and protect your personal information in accordance with
            POPIA (Protection of Personal Information Act).
          </p>
          <p className="mt-3 text-sm text-[#666]">
            Last updated: April 2025
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8 text-sm leading-relaxed text-[#cccccc]">

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Information We Collect</h2>
              <p className="mb-3">
                Blazr Wholesale collects personal information necessary to establish and maintain your
                wholesale account, process orders, and comply with applicable South African law. This
                includes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Business registration details (CIPC number, VAT number)</li>
                <li>Contact information (name, email, phone/WhatsApp)</li>
                <li>Physical address for delivery purposes</li>
                <li>Cannabis license details</li>
                <li>Order history and transaction records</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">How We Use Your Information</h2>
              <p className="mb-3">Your information is used exclusively for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Account registration and verification</li>
                <li>Processing and fulfilling wholesale orders</li>
                <li>Delivery coordination via vetted drivers</li>
                <li>Compliance with Cannabis for Private Purposes Act and POPIA</li>
                <li>Communication about orders, deliveries, and account status</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Data Protection (POPIA)</h2>
              <p className="mb-3">
                Blazr Wholesale is committed to protecting your personal information in accordance with
                POPIA. We implement appropriate technical and organizational measures to secure your data
                against unauthorized access, loss, or damage.
              </p>
              <p>
                We only process personal information with your consent, or where processing is necessary
                for the conclusion or performance of a contract to which you are a party.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Your Rights Under POPIA</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Right to access your personal information</li>
                <li>Right to correction or deletion of inaccurate information</li>
                <li>Right to object to processing of your personal information</li>
                <li>Right to complain to the Information Regulator</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active and for a
                period thereafter as required by South African tax and regulatory law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Third-Party Sharing</h2>
              <p className="mb-3">
                We do not sell or share your personal information with third parties except:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>With vetted delivery drivers for order fulfillment</li>
                <li>With regulatory authorities as required by law</li>
                <li>With our technology service providers (data processors bound by confidentiality)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Contact Us</h2>
              <p>
                To exercise your POPIA rights or raise any concerns about how we handle your data,
                contact us at{" "}
                <a href="mailto:privacy@blazr.africa" className="text-[#FAD03F] hover:underline">
                  privacy@blazr.africa
                </a>
                .
              </p>
            </section>
          </div>

          <div className="space-y-6">
            <Card className="card-surface">
              <CardContent className="p-5">
                <h3 className="font-semibold text-sm mb-4 text-white">Related Documents</h3>
                <div className="space-y-3">
                  <Link href="/terms" className="flex items-center gap-3 text-sm text-[#888] hover:text-[#FAD03F] transition">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span>Terms & Conditions</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
