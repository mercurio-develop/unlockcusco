import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { tool } from 'ai';

export const getBusinessDetails = tool({
  description: 'Looks up specific details for a local business by its exact name, returning operating hours, contact phone, website, and editorial summary.',
  inputSchema: z.object({
    businessName: z.string().describe('The exact name of the business to look up.'),
  }),
  execute: async ({ businessName }) => {
    try {
      const business = await prisma.business.findFirst({
        where: {
          name: {
            contains: businessName,
          }
        },
        select: {
          name: true,
          operatingHours: true,
          contactPhone: true,
          editorialSummary: true,
          priceEstimate: true,
          category: true,
        }
      });

      if (!business) {
        return { error: `Could not find a business matching "${businessName}".` };
      }

      return {
        name: business.name,
        operatingHours: business.operatingHours || 'Not available',
        contactPhone: business.contactPhone || 'Not available',
        editorialSummary: business.editorialSummary || 'Not available',
        priceEstimate: business.priceEstimate || 'Not available',
        category: business.category || 'Not available',
      };
    } catch (e) {
      console.error(e);
      return { error: 'Failed to look up business details.' };
    }
  }
});
