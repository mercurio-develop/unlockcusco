"use server"

import { prisma } from "@/lib/prisma"

export async function generateShadowLead(businessId: string, touristName: string, date: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  if (!business) {
    throw new Error("Business not found")
  }

  if (!business.whatsapp) {
    throw new Error("WhatsApp number not available for this business")
  }

  const rawText = `¡Hola equipo de ${business.name}! 👋 Nuestro asistente de IA (InkaPortal) acaba de recomendar su negocio a ${touristName} para la fecha ${date}. Como su negocio aún es un 'Perfil No Verificado', el turista no pudo pagarles directamente en la plataforma. Para recibir el contacto del turista y cerrar esta venta, haga clic aquí para reclamar su perfil gratis: https://inkaportal.pe/claim/${businessId}`
  
  const encodedText = encodeURIComponent(rawText)
  
  return { success: true, url: `https://wa.me/51${business.whatsapp}?text=${encodedText}` }
}
