"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Home, Map } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/dashboard", label: "For Business", icon: Map },
  ]

  return (
    <nav className="fixed top-0 w-full h-16 z-[100] bg-[#09090B]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 md:px-12">
      {/* Brand/Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFF8E7] flex items-center justify-center">
          <span className="text-black font-bold font-serif text-sm">V</span>
        </div>
        <span className="text-white font-serif tracking-wide font-medium group-hover:text-[#D4AF37] transition-colors">
          InkaPortal
        </span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive ? "text-[#D4AF37]" : "text-white/70 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Mobile Links (Icons only or simplified view) */}
      <div className="flex md:hidden items-center gap-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                isActive ? "text-[#D4AF37]" : "text-white/70 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
