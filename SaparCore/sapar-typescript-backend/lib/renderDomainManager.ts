import axios from 'axios';

/**
 * Automatically provisions a dedicated custom subdomain on Render for new tenants.
 * Calls Render REST API: POST https://api.render.com/v1/services/{serviceId}/custom-domains
 */
export async function registerRenderCustomDomain(subdomain: string): Promise<boolean> {
  const apiKey = process.env.RENDER_API_KEY;
  const serviceId = process.env.RENDER_FRONTEND_SERVICE_ID || 'srv-da9tftm7bikc73esh020';

  if (!apiKey || !subdomain) {
    return false;
  }

  const domainName = `${subdomain.toLowerCase().trim()}.sapar.uz`;

  try {
    const response = await axios.post(
      `https://api.render.com/v1/services/${serviceId}/custom-domains`,
      { name: domainName },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`[RenderDomainManager] Successfully registered custom domain ${domainName}:`, response.data);
    return true;
  } catch (error: any) {
    if (error.response?.status === 409) {
      console.log(`[RenderDomainManager] Domain ${domainName} already exists on Render.`);
      return true;
    }
    console.warn(`[RenderDomainManager] Failed to register domain ${domainName} on Render:`, error.response?.data || error.message);
    return false;
  }
}
