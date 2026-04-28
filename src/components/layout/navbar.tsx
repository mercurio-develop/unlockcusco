"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Home, Map, Sparkles } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/dashboard", label: "For Business", icon: Map },
  ]

  return (
    <nav className="fixed top-0 w-full z-[100] bg-white/90 backdrop-blur-xl border-b border-gray-200 h-14 flex items-center justify-center transition-all shadow-sm">
      <div className="w-full max-w-5xl px-4 md:px-6 flex items-center justify-between">
        
        {/* Brand/Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Sparkles className="w-4 h-4 text-rose-600" />
          <span className="text-slate-900 font-bold text-sm tracking-wide">
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
                className={`text-xs font-semibold tracking-wide transition-colors ${
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Mobile Links */}
        <div className="flex md:hidden items-center gap-5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  isActive ? "text-rose-600" : "text-slate-400 hover:text-slate-900"
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            )
          })}
        </div>
        
      </div>
    </nav>
  )
}
