import { redirect } from "next/navigation"

export default async function LoginPage(props: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { lang } = await props.params
  
  // Temporarily hide the login page by redirecting to the home page
  redirect(`/${lang}`)
}
