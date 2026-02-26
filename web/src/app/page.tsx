'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { useWalletClient } from '@/lib/wallet-provider';
import {
  Play,
  CircleDashed,
  MoreHorizontal,
  Search,
  Terminal,
  ArrowRight,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';

const resources = [
  { num: '01', name: 'migration guide walkthrough', category: 'guides', label: 'Migration Guide' },
  { num: '02', name: 'asset qualification api', category: 'api', label: 'Asset Qualification' },
  { num: '03', name: 'bridge security audit', category: 'security', label: 'Bridge Security' },
  { num: '04', name: 'changelog updates', category: 'api', label: 'Changelog' },
];

export default function HomePage() {
  const router = useRouter();
  const { connected, address, connect, disconnect, walletAvailable, connecting, error: walletError } = useWalletClient();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const parallaxBgRef = useRef<HTMLDivElement>(null);
  const parallaxCardRef = useRef<HTMLDivElement>(null);
  const footerTextRef = useRef<HTMLHeadingElement>(null);

  const onConnect = async () => {
    await connect();
  };

  const onDisconnect = async () => {
    await disconnect();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && connected) {
      router.push('/dashboard');
    }
  }, [mounted, connected, router]);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Parallax
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      if (parallaxBgRef.current) {
        parallaxBgRef.current.style.transform = `translateY(${scrollY * 0.05}px)`;
      }
      if (parallaxCardRef.current) {
        parallaxCardRef.current.style.transform = `translateY(${scrollY * -0.03}px)`;
      }
      if (footerTextRef.current) {
        const rect = footerTextRef.current.getBoundingClientRect();
        if (rect.top < windowHeight) {
          const move = (windowHeight - rect.top) * 0.1;
          footerTextRef.current.style.transform = `translateX(-${move}px)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initial reveal on load
  useEffect(() => {
    document.querySelectorAll('.reveal').forEach((el, index) => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        setTimeout(() => el.classList.add('active'), index * 100);
      }
    });
  }, []);

  const filterResources = useCallback(
    (category: string) => {
      setActiveCategory(category);
    },
    []
  );

  const filteredResources = resources.filter((r) => {
    const matchesSearch = r.name.includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header
        connected={connected}
        walletAddress={address}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />

      <main className="md:px-8 w-full max-w-[1800px] mt-24 mr-auto ml-auto pr-4 pb-20 pl-4">
        {mounted && !walletAvailable && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            No Solana wallet detected. Install Phantom or Solflare to connect.
          </div>
        )}
        {mounted && walletError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {walletError}
          </div>
        )}
        {/* Hero Section */}
        <section className="pt-10 md:pt-20 pb-12 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-12">
            <div className="lg:col-span-7 reveal active">
              <h1 className="md:text-7xl lg:text-8xl leading-[1.05] text-5xl font-semibold tracking-tighter">
                Migrate<br />
                To Solana<br />
                With Sunrise
              </h1>
            </div>
            <div className="lg:col-span-5 flex flex-col items-start lg:items-end lg:pl-10 reveal delay-100 active">
              <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-sm lg:text-right font-medium">
                The migration operating system for teams moving from EVM chains to Solana.
              </p>

              <button
                onClick={onConnect}
                disabled={connecting}
                className="group flex items-center gap-3 pl-4 pr-6 py-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-all duration-300 shadow-xl shadow-neutral-900/10 hover:shadow-neutral-900/20 hover:-translate-y-1"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Play className="w-3 h-3 text-black fill-black ml-0.5" />
                </div>
                <span className="text-sm font-semibold">
                  {connecting ? 'Connecting...' : connected ? 'Open Dashboard' : 'Start Migration'}
                </span>
              </button>
            </div>
          </div>

          {/* Parallax Image Container */}
          <div className="reveal delay-200 w-full h-[400px] md:h-[650px] rounded-[2rem] md:rounded-[3rem] overflow-hidden relative border border-neutral-200 shadow-sm group active">
            <div
              ref={parallaxBgRef}
              className="absolute inset-0 w-full h-[120%] -top-[10%]"
            >
              <Image
                src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4ff957af-9170-45ca-88fc-0cb4f3cd592e_3840w.webp"
                alt="Migration Platform"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

            {/* Overlay Card */}
            <div
              ref={parallaxCardRef}
              className="absolute bottom-8 left-8 md:bottom-12 md:left-12 bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl max-w-sm w-full hidden md:block border border-white/50"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">
                    Migration Report
                  </p>
                  <h4 className="text-sm font-bold text-neutral-900">EVM Asset Qualification</h4>
                </div>
                <div className="bg-blue-100 text-blue-700 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-blue-600 animate-pulse" />
                  Reviewing
                </div>
              </div>

              <div className="flex items-center justify-between mb-5">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-neutral-600">
                    MK
                  </div>
                  <div className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                    JL
                  </div>
                  <div className="w-8 h-8 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-neutral-600">
                    +5
                  </div>
                </div>
                <div className="text-xs text-neutral-500 font-medium">Due in 5 hours</div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium text-neutral-600">
                  <span>Analysis</span>
                  <span>92%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-900 w-[92%] rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent my-16 opacity-50" />

        {/* Dark Section */}
        <section className="rounded-[2rem] md:rounded-[3rem] bg-[#111111] text-white p-8 md:p-16 lg:p-24 overflow-hidden relative reveal">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neutral-800/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
            <div className="flex flex-col justify-center">
              <div className="mb-8 flex items-center gap-2 text-neutral-400 text-sm font-medium tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Sunrise Engine
              </div>
              <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-tight mb-8">
                Qualify.
                <span className="flex items-center gap-4 text-neutral-500">
                  <CircleDashed className="w-12 h-12 md:w-16 md:h-16 stroke-[1.5] animate-[spin_10s_linear_infinite]" />
                  Bridge.
                </span>
                Deploy.
              </h2>
              <p className="text-xl md:text-2xl text-neutral-400 max-w-md leading-relaxed">
                Infrastructure that qualifies, ranks, and migrates EVM assets to Solana without compromising security.
              </p>
            </div>

            <div className="relative mt-8 lg:mt-0 group">
              <div className="bg-[#1A1A1A] border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl relative transition-transform duration-500 ease-out">
                <div className="flex justify-between text-xs text-neutral-500 mb-8 font-medium tracking-wide">
                  <div className="flex gap-6">
                    <span className="text-white border-b border-white pb-1">Status</span>
                    <span className="hover:text-neutral-300 cursor-pointer transition-colors">Logs</span>
                    <span className="hover:text-neutral-300 cursor-pointer transition-colors">Config</span>
                  </div>
                  <MoreHorizontal className="w-4 h-4" />
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-neutral-600 mb-6 border-b border-neutral-800 pb-6">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
                <div className="bg-[#222] rounded-xl p-8 border border-neutral-700 relative overflow-hidden shadow-inner">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
                  <div className="flex justify-between text-xs font-medium text-neutral-500 mb-8">
                    <span className="text-white">Migration Engine</span>
                    <span>Solana Mainnet</span>
                  </div>
                  <div className="flex gap-1.5 h-10 mb-8 items-end justify-center">
                    <div className="w-1.5 bg-neutral-600 h-4 rounded-full" />
                    <div className="w-1.5 bg-neutral-600 h-6 rounded-full" />
                    <div className="w-1.5 bg-white h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-pulse" />
                    <div className="w-1.5 bg-neutral-700 h-8 rounded-full" />
                    <div className="w-1.5 bg-neutral-800 h-3 rounded-full" />
                  </div>
                  <div className="text-5xl font-mono text-white mb-2 text-center tracking-widest font-light font-mono-display">
                    99.99
                  </div>
                  <div className="text-neutral-500 text-sm mb-8 text-center">% Operational</div>
                  <button
                    onClick={onConnect}
                    className="w-full py-3.5 bg-white text-black text-sm font-bold rounded-full hover:bg-neutral-200 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    {connected ? 'View Dashboard' : 'Connect & Migrate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="w-full h-px bg-neutral-200 my-20" />

        {/* Resources Section */}
        <section className="mt-20 scroll-mt-24" id="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-0">
            {/* Left: Big Text Block with Search */}
            <div className="md:pr-24 md:border-r border-neutral-200 sticky top-32 self-start reveal">
              <h3 className="md:text-5xl lg:text-6xl leading-tight text-balance text-4xl font-semibold tracking-tighter mb-12">
                Technical resources for cross-chain migration teams.
              </h3>

              <div className="relative w-full max-w-sm group">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-b border-neutral-300 py-4 bg-transparent text-lg placeholder-neutral-400 focus:outline-none focus:border-black transition-colors pl-0"
                  placeholder="Search documentation..."
                />
                <div className="absolute right-0 top-4 transition-transform duration-300 group-focus-within:scale-110 group-focus-within:text-black text-neutral-400">
                  <Search className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-12 flex flex-wrap gap-3">
                {['all', 'api', 'security', 'guides'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => filterResources(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                      activeCategory === cat
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: List Menu */}
            <div className="md:pl-24 flex flex-col min-h-[500px] h-full justify-between">
              <ul className="space-y-4 text-right md:text-right w-full">
                {filteredResources.map((item) => (
                  <li key={item.num} className="group reveal active">
                    <a
                      href="#"
                      className="block border-b border-neutral-100 pb-8 hover:border-neutral-900 transition-all duration-300"
                    >
                      <div className="flex justify-between md:justify-end items-center gap-12">
                        <span className="text-sm font-mono text-neutral-300 group-hover:text-black transition-colors font-mono-display">
                          {item.num}
                        </span>
                        <span className="text-2xl md:text-3xl font-medium text-neutral-400 group-hover:text-black group-hover:translate-x-[-10px] transition-all duration-300">
                          {item.label}
                        </span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>

              {filteredResources.length === 0 && (
                <p className="text-center text-neutral-400 py-12">No results found.</p>
              )}

              {/* Card Feature */}
              <div className="self-end reveal hover:-translate-y-2 transition-transform duration-500 md:mt-8 bg-white w-full max-w-sm border-neutral-200 border rounded-2xl mt-16 pt-8 pr-8 pb-8 pl-8 shadow-xl">
                <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                  <Terminal className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-2 leading-tight">Migration CLI</h4>
                <p className="text-neutral-500 text-sm mb-8">
                  Qualify, bridge, and deploy your assets directly from the command line.
                </p>

                <button className="w-full flex items-center justify-between bg-neutral-900 text-white pl-6 pr-4 py-3.5 text-sm font-semibold rounded-full hover:bg-neutral-800 transition-all hover:pr-3 group">
                  Install CLI
                  <div className="bg-white/20 rounded-full p-1 group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="w-full h-px bg-neutral-200 my-20" />

        {/* Pricing Section */}
        <section className="py-12 md:py-24 relative reveal">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold tracking-widest text-neutral-500 uppercase mb-4">
                Investment
              </div>
              <h2 className="md:text-5xl lg:text-6xl leading-[1.1] text-4xl font-semibold text-neutral-900 tracking-tighter">
                Predictable pricing for every stage of migration.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Card 1: Highlighted */}
            <div className="relative bg-[#a5b4fc] rounded-3xl p-8 flex flex-col min-h-[360px] hover:scale-[1.01] transition-transform duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-black" />
                <span className="text-sm font-medium text-neutral-800">Pro Plan</span>
              </div>
              <div className="text-5xl md:text-6xl font-semibold text-black tracking-tighter mb-1 mt-auto">
                $499{' '}
                <span className="text-sm font-sans font-medium tracking-normal align-middle opacity-60">
                  / MONTH
                </span>
              </div>
              <div className="mt-8">
                <button className="w-full py-4 bg-white text-black text-sm font-bold rounded-full hover:bg-neutral-50 transition-colors uppercase tracking-wide">
                  Start Pro
                </button>
              </div>
            </div>

            {/* Card 2: Starter */}
            <div className="bg-neutral-50 rounded-3xl p-8 flex flex-col min-h-[360px] hover:bg-neutral-100 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full border border-neutral-400" />
                <span className="text-sm font-medium text-neutral-600">Starter</span>
              </div>
              <div className="text-5xl md:text-6xl font-semibold text-black tracking-tighter mb-1 mt-auto">
                $199{' '}
                <span className="text-sm font-sans font-medium tracking-normal align-middle opacity-60">
                  / MONTH
                </span>
              </div>
              <div className="mt-8">
                <button className="w-full py-4 bg-white border border-neutral-200 text-black text-sm font-bold rounded-full hover:border-black transition-colors uppercase tracking-wide shadow-sm">
                  Get Started
                </button>
              </div>
            </div>

            {/* Card 3: Enterprise */}
            <div className="bg-neutral-50 rounded-3xl p-8 flex flex-col min-h-[360px] hover:bg-neutral-100 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full border border-neutral-400" />
                <span className="text-sm font-medium text-neutral-600">Enterprise</span>
              </div>
              <div className="text-5xl md:text-6xl font-semibold text-black tracking-tighter mb-1 mt-auto">
                $899{' '}
                <span className="text-sm font-sans font-medium tracking-normal align-middle opacity-60">
                  / MONTH
                </span>
              </div>
              <div className="mt-8">
                <button className="w-full py-4 bg-white border border-neutral-200 text-black text-sm font-bold rounded-full hover:border-black transition-colors uppercase tracking-wide shadow-sm">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Dark CTA Section */}
        <section className="mb-20">
          <div className="relative w-full rounded-[2.5rem] bg-[#111111] overflow-hidden px-8 py-20 md:py-32 text-center reveal">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-white tracking-tighter leading-none mb-8">
                Ready to<br />Migrate?
              </h2>
              <p className="text-neutral-400 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
                Join 500+ teams bridging their assets from EVM to Solana with Sunrise.
              </p>
              <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
                <button
                  onClick={onConnect}
                  className="px-10 py-4 bg-white text-black rounded-full text-base font-bold hover:bg-neutral-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] min-w-[200px]"
                >
                  {connected ? 'Open Dashboard' : 'Get Started'}
                </button>
                <button className="px-10 py-4 bg-transparent border border-neutral-700 text-white rounded-full text-base font-semibold hover:border-white transition-all duration-300 min-w-[200px]">
                  Book Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="mt-20 overflow-hidden border-t border-black pt-12 relative">
          <div className="w-full overflow-hidden py-10">
            <h1
              ref={footerTextRef}
              className="text-[15vw] leading-[0.8] uppercase whitespace-nowrap select-none transition-transform duration-75 will-change-transform font-bold text-black tracking-tighter"
            >
              Sunrise Migration OS
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-8 gap-6 pb-12 reveal">
            <div className="flex gap-4">
              <a
                href="#"
                className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center border border-neutral-200 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center border border-neutral-200 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center border border-neutral-200 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <div className="flex flex-wrap gap-8 text-sm font-medium text-neutral-500">
              <a
                href="#"
                className="hover:text-black relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-black hover:after:w-full after:transition-all"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-black relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-black hover:after:w-full after:transition-all"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-black relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-black hover:after:w-full after:transition-all"
              >
                Status
              </a>
            </div>
            <div className="text-sm font-medium text-neutral-400">
              &copy; 2026 Sunrise Inc. All rights reserved.
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
