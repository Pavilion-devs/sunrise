import type { Metadata } from 'next';
import '@solana/wallet-adapter-react-ui/styles.css';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Sunrise — Migration OS',
  description: 'The migration operating system for teams moving from EVM to Solana via Sunrise.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#Fdfdfc] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
