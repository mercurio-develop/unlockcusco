"use client"

import { useState } from "react"
import { login, signup } from "../actions/auth-actions"
import { Loader2 } from "lucide-react"

interface AuthFormProps {
  type: "login" | "register"
  lang: string
  redirectPath?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: Record<string, any>
}

export function AuthForm({ type, lang, redirectPath, dict }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const isLogin = type === "login"

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    formData.append("lang", lang)
    if (redirectPath) {
      formData.append("redirect", redirectPath)
    }

    const action = isLogin ? login : signup
    const response = await action(formData)

    if (response?.error) {
      setError(response.error)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 w-full max-w-sm mx-auto">
      {error && (
        <div className="p-3 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
          {error}
        </div>
      )}
      
      {!isLogin && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="firstName">
              {dict.firstName || 'First Name'}
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-sm font-medium text-slate-900"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="lastName">
              {dict.lastName || 'Last Name'}
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-sm font-medium text-slate-900"
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="email">
          {dict.email || 'Email'}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isLoading}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-sm font-medium text-slate-900"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="password">
          {dict.password || 'Password'}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
          disabled={isLoading}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-sm font-medium text-slate-900"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLogin ? (dict.signIn || 'Sign In') : (dict.createAccount || 'Create Account')}
      </button>
    </form>
  )
}
