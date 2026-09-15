import type { Metadata } from 'next';
import { Bebas_Neue, Barlow_Condensed, DM_Sans } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { site } from '@/lib/content';
import { resolveTheme, logoNavPath, logoPath, faviconPath, logoNeedsPlate } from '@/lib/theme';
import './globals.css';

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});
const barlow = Barlow_Condensed({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-barlow',
  display: 'swap',
});
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dmsans', display: 'swap' });

const theme = resolveTheme();

export const metadata: Metadata = {
  title: { default: site.seo.home.title, template: `%s | ${site.business.name}` },
  description: site.seo.home.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bowralwheelrepairs.com.au'),
  openGraph: {
    title: site.seo.home.title,
    description: site.seo.home.description,
    type: 'website',
    locale: 'en_AU',
    siteName: site.business.name,
    images: [{ url: logoPath(theme) }],
  },
  twitter: {
    card: 'summary',
    title: site.seo.home.title,
    description: site.seo.home.description,
  },
  icons: { icon: faviconPath(theme) },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navLogo = logoNavPath(theme);
  const plate = logoNeedsPlate(theme);

  // Deliberately carries no review or rating properties: a new business has
  // none to cite, and inventing them is prohibited. Verifiable facts only.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: site.business.name,
    description: site.seo.home.description,
    telephone: '+61248722221',
    email: site.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.contact.street,
      addressLocality: site.contact.locality,
      addressRegion: site.contact.region,
      postalCode: site.contact.postcode,
      addressCountry: 'AU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.contact.geo.lat,
      longitude: site.contact.geo.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:30',
        closes: '17:00',
      },
    ],
    areaServed: ['Bowral', 'Mittagong', 'Moss Vale', 'Southern Highlands'],
  };

  return (
    <html
      lang="en-AU"
      data-theme={theme}
      className={`${bebas.variable} ${barlow.variable} ${dmSans.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Nav logoSrc={navLogo} plate={plate} />
        <main>{children}</main>
        <Footer logoSrc={navLogo} plate={plate} />
      </body>
    </html>
  );
}
