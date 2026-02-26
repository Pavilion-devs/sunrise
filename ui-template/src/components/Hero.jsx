import HeroSlotReel from "./HeroSlotReel";
import SwapWidget from "./SwapWidget";

export default function Hero() {
  return (
    <div className="relative">
      <div className="absolute -z-20 inset-x-0 -top-32 h-[calc(100%+128px)] bg-[url('https://www.sunrisedefi.com/bg.webp')] bg-cover bg-center bg-no-repeat opacity-80 max-md:-top-[157px] max-md:h-[calc(100%+157px)]" />
      <div
        className="absolute -z-10 inset-x-0 -top-32 h-[calc(100%+128px)] backdrop-blur max-md:-top-[157px] max-md:h-[calc(100%+157px)]"
        style={{
          background: "linear-gradient(rgba(255,255,255,0) 80%, rgba(253,253,253,0.5) 86%, rgb(251,251,251) 98%)",
        }}
      />
      <div className="mx-auto max-w-[1356px]">
        <div className="flex flex-row gap-9 mx-9 min-h-[795px] pt-20 max-md:flex-col max-md:mx-0 max-md:pt-0">
          <div className="grow text-left mt-12 max-md:text-center max-md:mx-4 max-md:mt-8">
            <h1 className="text-[56px] max-md:text-[36px] font-bold text-sunrise-hero mb-2 leading-[1.15]">
              <span>
                Trade <HeroSlotReel />
              </span>
              <span className="block">on Solana</span>
            </h1>
            <p className="text-[19px] max-md:text-[21px] font-medium text-sunrise-hero">
              Sunrise brings newly listed assets to Solana, from wherever they launch.
            </p>
          </div>
          <div className="-mt-14 max-md:mt-0 max-md:mb-16 flex justify-center">
            <SwapWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
