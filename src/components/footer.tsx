import Link from "next/link"

const PLATFORM_LINKS = [
  { href: "/catalogue", label: "Product Catalogue" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
]

const ACCESS_LINKS = [
  { href: "/apply", label: "Apply for Account" },
  { href: "/login", label: "Sign In" },
]

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy (POPIA)" },
]

export function Footer() {
  return (
    <footer className="border-t border-[#2a2a2a] bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <img
                src="/logos/103058_Blazr_Flat_RT_R_02.svg"
                alt="Blazr"
                className="h-10 w-auto"
              />
            </div>
            <p className="text-sm text-[#666] leading-relaxed max-w-sm">
              South Africa&apos;s premium B2B cannabis platform. Connecting licensed dispensaries with
              trusted cultivators. Private. Fast. Lit.
            </p>
            <p className="mt-4 text-xs text-[#444]">
              Licensed wholesale platform. All products lab-tested. Cannabis for Private Purposes Act compliant.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#666]">
              Platform
            </h3>
            <ul className="space-y-2">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#888] hover:text-[#FAD03F] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#666]">
              Legal
            </h3>
            <ul className="space-y-2">
              {ACCESS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#888] hover:text-[#FAD03F] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#888] hover:text-[#FAD03F] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#2a2a2a] pt-8 sm:flex-row">
          <p className="text-xs text-[#444]">
            © {new Date().getFullYear()} Blazr Wholesale. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-[#444]">
            <Link href="/terms" className="hover:text-[#666] transition">Privacy</Link>
            <Link href="/terms" className="hover:text-[#666] transition">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
