import { prisma } from "@/lib/prisma";

export async function getAgencyBySlug(slug: string) {
  return await prisma.business.findUnique({
    where: { slug },
    include: {
      tourPackages: true
    }
  });
}

export async function getAllAgencies() {
  return await prisma.business.findMany({
    where: { category: { in: ["AGENCY", "ADVENTURE"] } },
    include: {
      tourPackages: true
    }
  });
}
