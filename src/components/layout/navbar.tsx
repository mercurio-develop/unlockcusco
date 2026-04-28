"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Home, Map, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/dashboard", label: "For Business", icon: Map },
  ]

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 w-full z-[100] flex justify-center p-4 md:p-6 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center justify-between w-full max-w-5xl bg-[#09090B]/60 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 shadow-2xl">
        
        {/* Brand/Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-white/20 to-white/5 flex items-center justify-center border border-white/10 shadow-inner">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-serif tracking-wide font-medium text-sm sm:text-base hidden sm:block">
            INKAPORTAL
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                  isActive ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-white/10 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Mobile Links */}
        <div className="flex md:hidden items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative p-2.5 transition-colors rounded-full ${
                  isActive ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill-mobile"
                    className="absolute inset-0 bg-white/10 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className="w-5 h-5 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            )
          })}
        </div>
        
      </div>
    </motion.nav>
  )
}
