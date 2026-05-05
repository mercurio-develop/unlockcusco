import { prisma } from "../src/lib/prisma";

async function check() {
  try {
    const agencies = await prisma.business.findMany();
    console.log("Agencies found:", agencies.length);
    if (agencies.length > 0) {
      console.log("First agency keys:", Object.keys(agencies[0]));
    }
  } catch (e: any) {
    console.error("Prisma error during check:", e?.message || e);
  }
}

check();
