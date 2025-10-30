import '@/app/global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: {
    default: 'Bun - A fast, modern runtime for JavaScript and TypeScript',
    template: '%s | Bun',
  },
  description: 'Bun is a fast, modern runtime for JavaScript and TypeScript',
  metadataBase: new URL("https://bun-docs.vercel.app"),
  icons: "https://bun.com/logo.svg"
};