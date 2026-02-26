'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Header({
  connected,
  walletAddress,
  onConnect,
  onDisconnect,
}: {
  connected: boolean;
  walletAddress?: string;
  onConnect: () => void | Promise<void>;
  onDisconnect: () => void | Promise<void>;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 md:px-12 md:py-6 w-full max-w-[1800px] mx-auto bg-[#Fdfdfc]/80 backdrop-blur-md transition-all duration-300 border-b ${
        scrolled ? 'shadow-sm bg-[#Fdfdfc]/90 border-neutral-100' : 'border-transparent'
      }`}
    >
      <Link href="/" className="text-xl font-semibold tracking-tight cursor-pointer hover:opacity-70 transition-opacity">
        Sunrise.
      </Link>

      <div className="hidden md:flex gap-8 text-sm font-medium text-neutral-600">
        <Link href="#" className="hover:text-black transition-colors">Platform</Link>
        <Link href="#" className="hover:text-black transition-colors">Migrate</Link>
        <Link href="#" className="hover:text-black transition-colors">Developers</Link>
      </div>

      <button
        className="px-5 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-semibold hover:bg-neutral-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-neutral-200/50"
        onClick={connected ? onDisconnect : onConnect}
      >
        {connected ? `${walletAddress?.slice(0, 4)}...${walletAddress?.slice(-4)}` : 'Connect Wallet'}
      </button>
    </nav>
  );
}
