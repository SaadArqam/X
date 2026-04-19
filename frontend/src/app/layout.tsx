import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { PageTransition } from './page-transition';
import { Layout } from '@/components/layout/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: "DevX",
    template: "%s | DevX"
  },
  description: "A modern developer social platform to share, explore, and collaborate on projects.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "DevX",
    description: "Developer social platform",
    type: 'website',
    locale: 'en_US',
    siteName: 'DevX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevX',
    description: 'A modern social blogging platform for developers.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F9F9F7]`}>
        <Providers>
          <Layout>
            <PageTransition>{children}</PageTransition>
          </Layout>
        </Providers>
      </body>
    </html>
  );
}
