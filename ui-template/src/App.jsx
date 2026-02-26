import { useEffect, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Partners from "./components/Partners";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import { dashboardSeed } from "./data/dashboardSeed";

const WALLET_KEY = "sunrise_wallet_connected";
const ADDRESS_KEY = "sunrise_wallet_address";

function makeMockAddress() {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < 44; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function Landing({ onEnterDashboard }) {
  return (
    <>
      <main>
        <Hero />
        <div className="mx-auto max-w-[1356px] px-8 -mt-16 md:-mt-24 mb-12 relative z-20">
          <div className="rounded-2xl border border-white/60 bg-white/45 p-5 backdrop-blur-md text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-sunrise-heading">Asset Qualification OS</h2>
            <p className="text-sunrise-page-text mt-2">
              Rank migration candidates with live market and Tier-1 listing data, then generate Sunrise-ready shortlists.
            </p>
            <button
              type="button"
              onClick={onEnterDashboard}
              className="mt-4 rounded-full bg-sunrise-btn text-white px-5 py-2.5 font-medium hover:opacity-90"
            >
              Enter Dashboard
            </button>
          </div>
        </div>
        <Partners />
      </main>
      <Footer />
    </>
  );
}

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [view, setView] = useState("landing");

  useEffect(() => {
    const connected = localStorage.getItem(WALLET_KEY) === "1";
    const storedAddress = localStorage.getItem(ADDRESS_KEY) || "";
    if (connected && storedAddress) {
      setIsConnected(true);
      setWalletAddress(storedAddress);
      setView("dashboard");
    }
  }, []);

  const connectWallet = () => {
    const address = walletAddress || makeMockAddress();
    localStorage.setItem(WALLET_KEY, "1");
    localStorage.setItem(ADDRESS_KEY, address);
    setIsConnected(true);
    setWalletAddress(address);
    setView("dashboard");
  };

  const disconnectWallet = () => {
    localStorage.removeItem(WALLET_KEY);
    localStorage.removeItem(ADDRESS_KEY);
    setIsConnected(false);
    setWalletAddress("");
    setView("landing");
  };

  const navigate = (target) => {
    if (target === "dashboard" && !isConnected) {
      connectWallet();
      return;
    }
    setView(target === "dashboard" ? "dashboard" : "landing");
  };

  return (
    <div
      className="bg-cover bg-center bg-no-repeat text-sunrise-page-text min-h-screen"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(253,253,253,0.5) 60.58%, #fbfbfb 93.66%), url('https://www.sunrisedefi.com/bg.webp')",
      }}
    >
      <div className="mx-auto text-center flex flex-col min-h-screen backdrop-blur-[16px]">
        <Header
          isConnected={isConnected}
          walletAddress={walletAddress}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
          onNavigate={navigate}
        />

        <div className="flex flex-col gap-1 flex-1 overflow-y-auto relative w-full">
          {view === "dashboard" && isConnected ? (
            <Dashboard data={dashboardSeed} walletAddress={walletAddress} />
          ) : (
            <Landing onEnterDashboard={connectWallet} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
