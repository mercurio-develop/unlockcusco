import { prisma } from "../src/lib/prisma";
import axios from "axios";

const GHOST_PHONE_URL = process.env.GHOST_PHONE_URL || "http://localhost:4000";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "dev-secret";

async function retargetLeads() {
  console.log("🚀 Starting WhatsApp Retargeting for 24h old leads...");

  // Calculate the time window: exactly 24 hours ago (+/- 1 hour to catch all)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);

  const leads = await prisma.lead.findMany({
    where: {
      createdAt: {
        gte: twentyFiveHoursAgo,
        lte: twentyFourHoursAgo,
      },
      touristPhone: {
        not: null,
      },
    },
    include: {
      business: true,
    },
  });

  console.log(`Found ${leads.length} leads to check in with.`);

  for (const lead of leads) {
    try {
      const message = `Hi ${lead.touristName}! 🏔️ Vallecito Concierge here. How was your experience with ${lead.business.name} yesterday? We'd love to hear your feedback to help other travelers and support local businesses!`;

      await axios.post(
        `${GHOST_PHONE_URL}/api/message/send`,
        {
          phone: lead.touristPhone,
          message: message,
        },
        {
          headers: {
            Authorization: `Bearer ${WEBHOOK_SECRET}`,
          },
        }
      );

      console.log(`✅ Sent retargeting message to ${lead.touristName} (${lead.touristPhone})`);
    } catch (error: any) {
      console.error(`❌ Failed to retarget lead ${lead.id}:`, error.message);
    }
  }

  console.log("🎯 Retargeting batch complete.");
}

retargetLeads()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
