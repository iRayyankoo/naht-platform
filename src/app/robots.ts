import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
  
  // Use canonicalBaseUrl from CRM, fallback to env variable or naht-re.sa
  const baseUrl = settings?.canonicalBaseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://naht-re.sa';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/crm/',
        '/api/',
        '/thank-you/',
        '/auth/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
