import { USDCIcon, SolanaChainIcon } from "./TokenIcons";
import { INXIcon } from "./TokenIcons";

function WalletIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

function SwapArrowIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect y="0.5" width="36" height="36" rx="8" fill="none" />
      <path d="M18.5 14.8235L15 11.3235L11.5 14.8235" stroke="currentColor" strokeWidth="1.5" />
      <path d="M24.5 21.8235L21 25.3235L17.5 21.8235" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21 25.3235L21 16.3235" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 11.3235L15 20.3235" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TokenRow({ label, tokenName, tokenIcon, chainIcon, placeholder = "0", disabled = false }) {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/40 p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-zinc-500">{label}</span>
        <div className="flex items-center gap-1 text-sm text-zinc-400">
          <span>Not connected</span>
          <WalletIcon />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <button className="flex items-center gap-2 bg-white/70 rounded-full px-3 py-2 border border-white/50 hover:border-zinc-300 transition-colors">
          <span className="relative">
            <span className="w-[34px] h-[34px] block rounded-full overflow-hidden">{tokenIcon}</span>
            <span className="absolute -top-1 -right-1 w-[14px] h-[14px] block rounded-sm overflow-hidden">{chainIcon}</span>
          </span>
          <span className="font-medium text-zinc-700">{tokenName}</span>
        </button>
        <input
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          className="bg-transparent text-right text-4xl text-zinc-500 w-full outline-none placeholder:text-zinc-300 disabled:opacity-50"
        />
      </div>
    </div>
  );
}

export default function SwapWidget() {
  return (
    <div className="w-full max-w-[380px] rounded-3xl border border-white/60 bg-white/55 backdrop-blur-md p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-500">
            <path d="M10 8C10 9.10457 9.10457 10 8 10C6.89543 10 6 9.10457 6 8M10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8M10 8H14M6 8H2" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="text-lg font-semibold text-zinc-700">Swap</h2>
        </div>
        <button className="p-1 rounded text-zinc-400 opacity-50 cursor-not-allowed" disabled>
          <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.75316 14.4526C7.75341 13.6108 7.98056 12.7845 8.41069 12.0608C8.84083 11.3372 9.45805 10.7428 10.1974 10.3402C10.9368 9.93769 11.771 9.74185 12.6123 9.77334C13.4536 9.80482 14.2708 10.0625 14.978 10.5191C14.983 10.1722 14.9857 9.80192 14.9857 9.40238C14.9857 7.34816 14.9158 6.06606 14.7778 4.73805H14.7974C14.7211 3.99804 14.4385 3.29433 13.9818 2.70707C13.5251 2.11981 12.9127 1.6726 12.2142 1.41636C12.1773 1.40238 12.1404 1.38908 12.1031 1.37643C11.8271 1.28366 11.5418 1.22152 11.2522 1.19114L11.2246 1.18814C10.1198 1.07471 9.94245 0.983887 7.61277 0.983887C5.2831 0.983887 4.90619 1.07471 3.8024 1.18981L3.77478 1.1928C3.47079 1.22473 3.17151 1.29171 2.8829 1.3924V1.37743C2.16329 1.6221 1.52891 2.06797 1.05498 2.66219C0.581041 3.25641 0.287419 3.97405 0.208915 4.73006C0.0705256 6.06073 0 7.34417 0 9.40238C0 11.4606 0.0705256 12.744 0.208915 14.0747C0.303414 14.9827 0.707339 15.8307 1.35292 16.4762C1.99849 17.1217 2.84644 17.5255 3.75449 17.6199L3.7821 17.6229C4.88689 17.738 5.06387 17.8289 7.39355 17.8289C8.16534 17.8289 8.72422 17.8189 9.16301 17.8013C8.71616 17.3656 8.36117 16.8448 8.11902 16.2697C7.87687 15.6945 7.75246 15.0767 7.75316 14.4526ZM3.86094 5.41336H11.1234C11.3336 5.41336 11.5351 5.49685 11.6837 5.64545C11.8323 5.79406 11.9158 5.99562 11.9158 6.20578C11.9158 6.41594 11.8323 6.61749 11.6837 6.7661C11.5351 6.91471 11.3336 6.99819 11.1234 6.99819H3.86261C3.65245 6.99819 3.45089 6.91471 3.30229 6.7661C3.15368 6.61749 3.07019 6.41594 3.07019 6.20578C3.07019 5.99562 3.15368 5.79406 3.30229 5.64545C3.45089 5.49685 3.65245 5.41336 3.86261 5.41336H3.86094ZM3.86094 10.3891C3.65355 10.3848 3.45608 10.2995 3.31091 10.1513C3.16574 10.0031 3.08444 9.80393 3.08444 9.59649C3.08444 9.38906 3.16574 9.18988 3.31091 9.04171C3.45608 8.89353 3.65355 8.80816 3.86094 8.80391H8.00299C8.21038 8.80816 8.40784 8.89353 8.55302 9.04171C8.69819 9.18988 8.77949 9.38906 8.77949 9.59649C8.77949 9.80393 8.69819 10.0031 8.55302 10.1513C8.40784 10.2995 8.21038 10.3848 8.00299 10.3891H3.86094Z" fill="currentColor" />
            <path d="M12.4362 10.8887C11.7313 10.8887 11.0423 11.0977 10.4562 11.4893C9.87013 11.8809 9.41334 12.4375 9.1436 13.0887C8.87386 13.7399 8.80328 14.4565 8.94079 15.1478C9.07831 15.8391 9.41773 16.4742 9.91615 16.9726C10.4146 17.471 11.0496 17.8104 11.7409 17.9479C12.4322 18.0855 13.1488 18.0149 13.8 17.7451C14.4512 17.4754 15.0078 17.0186 15.3994 16.4325C15.791 15.8465 16.0001 15.1574 16.0001 14.4525C16.0001 13.5073 15.6246 12.6009 14.9562 11.9325C14.2879 11.2642 13.3814 10.8887 12.4362 10.8887ZM13.8487 14.9742H12.3653C12.2528 14.9742 12.145 14.9295 12.0654 14.8499C11.9859 14.7704 11.9412 14.6625 11.9412 14.55V12.2712C11.9412 12.1587 11.9859 12.0509 12.0654 11.9713C12.145 11.8918 12.2528 11.8471 12.3653 11.8471C12.4778 11.8471 12.5857 11.8918 12.6653 11.9713C12.7448 12.0509 12.7895 12.1587 12.7895 12.2712V14.1259H13.8487C13.9612 14.1259 14.0691 14.1706 14.1486 14.2501C14.2282 14.3296 14.2728 14.4375 14.2728 14.55C14.2728 14.6625 14.2282 14.7704 14.1486 14.8499C14.0691 14.9295 13.9612 14.9742 13.8487 14.9742Z" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <TokenRow
          label="From"
          tokenName="USDC"
          tokenIcon={<USDCIcon />}
          chainIcon={<SolanaChainIcon />}
        />

        <div className="flex justify-center -my-1 z-10">
          <button className="rounded-lg border border-white/50 bg-white/70 p-1 hover:bg-white/90 transition-colors text-zinc-500">
            <SwapArrowIcon />
          </button>
        </div>

        <TokenRow
          label="To"
          tokenName="INX"
          tokenIcon={
            <img
              alt="INX"
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF81OTVfOTI3KSI+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iMjAwIiBmaWxsPSIjRkU2RjM5Ii8+CjxwYXRoIGQ9Ik0xMjggMjQ1SDIwOVYxNzNIMjU0VjI5MEg4M1YxMTBIMTI4VjI0NVoiIGZpbGw9IiMxMDExMTQiLz4KPHBhdGggZD0iTTMxNyAyOTBIMjcyVjE1NUgxOTFWMjI3SDE0NlYxMTBIMzE3VjI5MFoiIGZpbGw9IiMxMDExMTQiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF81OTVfOTI3Ij4KPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIHJ4PSIyMDAiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+"
              className="w-[34px] h-[34px] rounded-full"
            />
          }
          chainIcon={<SolanaChainIcon />}
          disabled
        />
      </div>

      <div className="mt-2 mb-4 px-1">
        <span className="text-sm text-zinc-500">1 INX = $0.01</span>
      </div>

      <button className="w-full py-3 rounded-xl bg-sunrise-btn text-sunrise-btn-text font-medium text-base hover:opacity-90 transition-opacity">
        Connect source wallet
      </button>
    </div>
  );
}
