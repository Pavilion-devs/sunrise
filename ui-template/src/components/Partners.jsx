const partners = [
  { name: "Jupiter", href: "https://jup.ag/?buy=inxKXw9V2NDZE7hDijzpJaKKUb97NEPJDTCEEiYg4yY", logo: "https://www.sunrisedefi.com/partner-logos/jupiter.svg", w: 104, h: 32 },
  { name: "Phantom", href: "https://phantom.com/", logo: "https://www.sunrisedefi.com/partner-logos/phantom.svg", w: 122, h: 24 },
  { name: "Backpack", href: "https://backpack.app/", logo: "https://www.sunrisedefi.com/partner-logos/backpack.svg", w: 159, h: 32 },
  { name: "Orb", href: "https://orb.helius.dev/address/inxKXw9V2NDZE7hDijzpJaKKUb97NEPJDTCEEiYg4yY", logo: "https://www.sunrisedefi.com/partner-logos/orb.svg", w: 84, h: 24 },
  { name: "Axiom", href: "https://axiom.trade/discover?chain=sol", logo: "https://www.sunrisedefi.com/partner-logos/axiom.svg", w: 108, h: 36 },
  { name: "Mayan", href: "https://swap.mayan.finance/", logo: "https://www.sunrisedefi.com/partner-logos/mayan.svg", w: 124, h: 32 },
  { name: "Orca", href: "https://www.orca.so/", logo: "https://www.sunrisedefi.com/partner-logos/orca.svg", w: 113, h: 22 },
  { name: "Titan", href: "https://titan.exchange/swap", logo: "https://www.sunrisedefi.com/partner-logos/titan.svg", w: 112, h: 28 },
  { name: "Drift", href: "https://www.drift.trade/", logo: "https://www.sunrisedefi.com/partner-logos/drift.svg", w: 77, h: 24 },
  { name: "dFlow", href: "https://dflow.net/", logo: "https://www.sunrisedefi.com/partner-logos/dflow.svg", w: 109, h: 28 },
  { name: "Kamino", href: "https://kamino.com/swap/", logo: "https://www.sunrisedefi.com/partner-logos/kamino.svg", w: 129, h: 40 },
  { name: "Solflare", href: "https://www.solflare.com/", logo: "https://www.sunrisedefi.com/partner-logos/solflare.svg", w: 88, h: 21 },
  { name: "Meteora", href: "https://www.meteora.ag/", logo: "https://www.sunrisedefi.com/partner-logos/meteora.svg", w: 124, h: 28 },
  { name: "Portal", href: "https://portalbridge.com/?toChain=Solana&toToken=INX", logo: "https://www.sunrisedefi.com/partner-logos/portal.svg", w: 136, h: 27 },
];

export default function Partners() {
  return (
    <div className="py-12 bg-sunrise-off-white">
      <div className="mx-auto max-w-[1356px]">
        <h3 className="text-[21px] text-sunrise-heading mb-2 text-center">Available in your favorite app</h3>
        <div className="flex flex-row gap-6 justify-center items-center flex-wrap">
          {partners.map((p) => (
            <a
              key={p.name}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-20 w-50 border border-white rounded-3xl bg-sunrise-partner hover:border-sunrise-hover transition-colors"
              href={p.href}
            >
              <img
                alt={`${p.name} logo`}
                loading="lazy"
                width={p.w}
                height={p.h}
                src={p.logo}
                style={{ color: "transparent" }}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
