import SunriseLogo from "./SunriseLogo";

const navLinks = [
  { label: "Home", id: "home" },
  { label: "Swap", id: "swap" },
  { label: "Deposit", id: "deposit" },
  { label: "Withdraw", id: "withdraw" },
  { label: "Apply", id: "apply" },
];

function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function Header({
  onNavigate,
  onConnect,
  onDisconnect,
  isConnected = false,
  walletAddress = "",
}) {
  return (
    <header className="relative transition-colors duration-300 bg-transparent">
      <div className="flex flex-row gap-0 justify-between items-center px-8 w-full py-2 box-border max-md:px-4">
        <button
          type="button"
          className="[&_svg]:h-8 [&_svg]:w-auto [&_svg]:transition-[filter] [&_svg]:duration-300 [&_svg]:brightness-0 [&_svg]:invert cursor-pointer"
          onClick={() => onNavigate("landing")}
        >
          <SunriseLogo />
        </button>

        <nav className="relative max-w-max flex-1 items-center justify-center hidden md:flex p-1">
          <ul className="flex flex-1 list-none items-center justify-center gap-4">
            {navLinks.map((link) => (
              <li key={link.label} className="relative">
                <button
                  type="button"
                  className="flex flex-col gap-1 rounded-sm p-2 transition-all outline-none text-base text-white/80 hover:text-white no-underline font-medium data-[active=true]:text-white"
                  data-active={link.id === "home" ? "true" : "false"}
                  onClick={() => onNavigate(link.id === "home" ? "landing" : "dashboard")}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <span className="hidden md:inline text-xs text-white/85 rounded-full border border-white/30 bg-white/10 px-3 py-1.5">
                {shortAddress(walletAddress)}
              </span>
              <button
                type="button"
                onClick={onDisconnect}
                className="rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              className="rounded-full border border-white/40 bg-white/20 px-4 py-2 text-sm text-white hover:bg-white/25 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
