import { INXIcon, HYPEIcon, LITIcon, MONIcon } from "./TokenIcons";

const tokens = [
  { icon: <INXIcon />, name: "INX" },
  { icon: <INXIcon />, name: "INX" },
  { icon: <HYPEIcon />, name: "HYPE" },
  { icon: <LITIcon />, name: "LIT" },
  { icon: <MONIcon />, name: "MON" },
  // Duplicates for seamless loop
  { icon: <INXIcon />, name: "INX" },
  { icon: <INXIcon />, name: "INX" },
  { icon: <HYPEIcon />, name: "HYPE" },
  { icon: <LITIcon />, name: "LIT" },
  { icon: <MONIcon />, name: "MON" },
];

export default function HeroSlotReel() {
  return (
    <span
      className="inline-block align-text-bottom mx-[0.25em] overflow-hidden relative [&_svg]:align-text-bottom [&_svg]:h-[1em] [&_svg]:w-[1em]"
      style={{ height: "1.2em" }}
    >
      <span
        className="inline-flex flex-col"
        style={{
          animation: "14.5s ease-in-out 0s infinite normal none running slot-reel",
          height: "12em",
        }}
      >
        {tokens.map((token, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-[0.25em] whitespace-nowrap"
            style={{ height: "1.2em" }}
          >
            {token.icon}
            {token.name}
          </span>
        ))}
      </span>
    </span>
  );
}
