/** Site configuration — branding and defaults */

export const siteDefaults = {
  siteName: 'SweetCMS',
  siteUrl: 'http://localhost:3000',
  contactEmail: 'admin@sweetcms.dev',
} as const;

export const clientEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? siteDefaults.siteUrl,
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? siteDefaults.siteName,
} as const;

export const siteConfig = {
  name: clientEnv.siteName,
  description: 'Agent-driven headless CMS for T3 Stack',
  url: clientEnv.appUrl,

  seo: {
    title: `${clientEnv.siteName} — Agent-driven headless CMS`,
    description:
      'Open-source headless CMS built on Next.js, tRPC, Drizzle, and Better Auth.',
  },
} as const;
