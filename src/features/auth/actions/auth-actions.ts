'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const lang = formData.get('lang') as string || 'en'
  const redirectPath = formData.get('redirect') as string || `/${lang}/dashboard`

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(redirectPath)
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const lang = formData.get('lang') as string || 'en'

  if (!email || !password || !firstName || !lastName) {
    return { error: 'All fields are required' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Create Prisma User record to sync
    try {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          firstName: firstName,
          lastName: lastName,
        }
      })
    } catch (dbError) {
      console.error('Error creating user in Prisma:', dbError)
      // Even if prisma sync fails, we want to let the user know they signed up,
      // but ideally we should have a retry mechanism or robust webhook sync in production.
    }
  }

  revalidatePath('/', 'layout')
  redirect(`/${lang}/dashboard`)
}

export async function logout(lang: string = 'en') {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect(`/${lang}`)
}
