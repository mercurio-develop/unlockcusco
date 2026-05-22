"use client"

import Link from "next/link"
import { LogOut, User as UserIcon } from "lucide-react"
import { logout } from "../actions/auth-actions"
import type { User } from "@prisma/client"

interface AuthButtonProps {
  user?: User | null
  lang: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: Record<string, any>
}

export function AuthButton({ user, lang, dict }: AuthButtonProps) {
  if (!user) {
    return (
      <Link
        href={`/${lang}/register`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[11px] transition-all border bg-slate-900 text-white border-transparent shadow-sm hover:scale-105"
      >
        <span>{dict.signup || 'Sign Up'}</span>
      </Link>
    )
  }

  const handleLogout = async () => {
    await logout(lang)
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/${lang}/dashboard`}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        title={dict.dashboard || 'Dashboard'}
      >
        <UserIcon className="w-4 h-4" />
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
        title={dict.logout || 'Log Out'}
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  )
}
