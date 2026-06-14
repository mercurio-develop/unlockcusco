/**
 * Utility to convert direct booking URLs into Travelpayouts affiliate shortlinks.
 * 
 * Documentation: https://support.travelpayouts.com/hc/en-us/articles/25289759198226-API-for-Travelpayouts-partner-links
 */

export interface AffiliateLinkRequest {
  url: string;
  sub_id?: string;
}

export interface AffiliateLinkResponse {
  url: string;
  code: string;
  partner_url: string;
}

export async function generateAffiliateLinks(links: AffiliateLinkRequest[]): Promise<AffiliateLinkResponse[]> {
  const apiToken = process.env.TRAVELPAYOUTS_API_TOKEN;
  const projectId = process.env.TRAVELPAYOUTS_PROJECT_ID;
  const markerId = process.env.TRAVELPAYOUTS_MARKER_ID;

  if (!apiToken || !projectId || !markerId) {
    console.warn("Travelpayouts API credentials are not fully configured in environment variables.");
    return [];
  }

  // API accepts max 10 links per request, limit input just in case
  const linksToProcess = links.slice(0, 10);

  try {
    const response = await fetch("https://api.travelpayouts.com/links/v1/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": apiToken,
      },
      body: JSON.stringify({
        trs: parseInt(projectId, 10),
        marker: parseInt(markerId, 10),
        shorten: true,
        links: linksToProcess,
      }),
    });

    if (!response.ok) {
      console.error("Travelpayouts API error:", await response.text());
      return [];
    }

    const data = await response.json();
    return data.result?.links || [];
  } catch (error) {
    console.error("Failed to generate Travelpayouts affiliate links:", error);
    return [];
  }
}
