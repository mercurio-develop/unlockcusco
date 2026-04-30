import { prisma } from "@/lib/prisma";

export async function getAgencyBySlug(slug: string) {
  return await prisma.agency.findUnique({
    where: { slug },
    include: {
      tourPackages: true
    }
  });
}

export async function getAllAgencies() {
  return await prisma.agency.findMany({
    include: {
      tourPackages: true
    }
  });
}
