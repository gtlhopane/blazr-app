"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, ChevronDown } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

const NAV_LINKS = [
  { href: "/catalogue", label: "Catalogue" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-[#2a2a2a] bg-[#0A0A0A]/90 glass"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logos/103058_Blazr_Flat_RT_R_01.svg"
            alt="Blazr"
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-white"
                  : "text-[#888] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link href="/buyer">
              <Button variant="ghost" size="sm" className="text-[#888] hover:text-white hover:bg-[#1a1a1a]">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-[#888] hover:text-white hover:bg-[#1a1a1a]">
                  Sign In
                </Button>
              </Link>
              <Link href="/apply">
                <Button size="sm" className="bg-[#FAD03F] hover:bg-[#f5e07a] text-black font-semibold gap-1.5">
                  Get Access
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger className="md:hidden">
            <Button variant="ghost" size="icon" className="text-[#888]">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-[#2a2a2a] bg-[#0A0A0A] p-6">
            <div className="flex flex-col gap-6 pt-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-medium ${
                    pathname === link.href ? "text-white" : "text-[#888]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-[#2a2a2a]" />
              {user ? (
                <Link href="/buyer" className="text-base font-medium text-[#FAD03F]">
                  Dashboard →
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-base font-medium text-[#888]">
                    Sign In
                  </Link>
                  <Link href="/apply">
                    <Button className="w-full bg-[#FAD03F] hover:bg-[#f5e07a] text-black font-semibold">
                      Apply for Access
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
