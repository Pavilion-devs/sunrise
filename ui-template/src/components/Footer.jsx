function XIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.8182 12.5459H12L16.5059 18.5538L12.2454 23.4549H13.6909L17.1754 19.4464L20.1818 23.455H24L19.3046 17.1944L23.3455 12.5459H21.9001L18.6351 16.3018L15.8182 12.5459ZM20.7273 22.3641L14.1818 13.6368H15.2727L21.8182 22.3641H20.7273Z" fill="currentColor" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" fill="currentColor" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.4775 13.0029C22.4508 12.5333 21.3604 12.191 20.2222 12C20.0789 12.2467 19.9197 12.581 19.8082 12.8437C18.5977 12.6686 17.3958 12.6686 16.2019 12.8437C16.0905 12.581 15.9233 12.2467 15.788 12C14.6419 12.191 13.5515 12.5333 12.5319 13.0029C10.4704 16.0433 9.91324 19.0121 10.1918 21.9412C11.5608 22.9361 12.8821 23.541 14.1803 23.939C14.4986 23.5092 14.7852 23.0475 15.0319 22.562C14.5623 22.3869 14.1166 22.172 13.6868 21.9173C13.7982 21.8378 13.9096 21.7502 14.0131 21.6626C16.6078 22.8486 19.4183 22.8486 21.9811 21.6626C22.0926 21.7502 22.1961 21.8378 22.3075 21.9173C21.8777 22.172 21.432 22.3869 20.9624 22.562C21.2092 23.0475 21.4957 23.5092 21.814 23.939C23.1114 23.541 24.4406 22.9361 25.8025 21.9412C26.1447 18.5506 25.2604 15.6056 23.4775 13.0029ZM15.3901 20.1344C14.6101 20.1344 13.9733 19.4261 13.9733 18.5585C13.9733 17.6909 14.5941 16.9826 15.3901 16.9826C16.178 16.9826 16.8227 17.6909 16.8068 18.5585C16.8068 19.4261 16.178 20.1344 15.3901 20.1344ZM20.6202 20.1344C19.8401 20.1344 19.2025 19.4261 19.2025 18.5585C19.2025 17.6909 19.8242 16.9826 20.6202 16.9826C21.4081 16.9826 22.0528 17.6909 22.0369 18.5585C22.0369 19.4261 21.4161 20.1344 20.6202 20.1344Z" fill="currentColor" />
    </svg>
  );
}

function WormholeIcon() {
  return (
    <svg viewBox="0 0 255.4235 255.4555" className="h-4 w-4 text-black">
      <path d="m197.9535,174.6565c-7.318,12.735-20.858,20.566-35.532,20.566h-23.731v-80.03l-34.251,59.483c-7.3188,12.734-20.8583,20.565-35.5323,20.565h-23.5661v-118.1051h47.4067v79.8281l45.9427-79.7915v-.0366h47.389v80.1581l49.785-86.5071c2.013-3.513,1.976-7.8676-.201-11.2891C212.7015,23.2333,171.9905-.6805,125.7365.0148,55.203,1.1126-.3641,57.8872.0018,128.4215c.3659,70.222,57.4151,127.034,127.7107,127.034s127.711-57.178,127.711-127.711c0-11.363-1.5-22.377-4.299-32.8796-.842-3.1836-5.087-3.7691-6.734-.9331l-46.455,80.7067.018.018Z" fill="currentColor" />
    </svg>
  );
}

const socialLinks = [
  { href: "https://x.com/Sunrise_DeFi", title: "Join our community on X!", icon: <XIcon />, iconClass: "[&>svg]:w-9 [&>svg]:h-9" },
  { href: "https://t.me/sunrise_defi", title: "Chat with us on Telegram!", icon: <TelegramIcon />, iconClass: "[&>svg]:w-6 [&>svg]:h-6" },
  { href: "https://discord.gg/sunrise-defi", title: "Chat with us on Discord!", icon: <DiscordIcon />, iconClass: "[&>svg]:w-9 [&>svg]:h-9" },
];

export default function Footer() {
  return (
    <footer className="flex items-center justify-between px-10 py-6 gap-6 w-full box-border text-sunrise-link max-sm:flex-col max-sm:gap-3 max-sm:px-6 max-sm:py-4 bg-sunrise-off-white">
      <div className="flex items-center gap-6 max-sm:grid max-sm:grid-cols-2 max-sm:grid-rows-[auto_auto] max-sm:w-full max-sm:gap-3">
        <a className="text-zinc-700 no-underline hover:underline" href="/privacy-policy">Privacy Policy</a>
        <a className="text-zinc-700 no-underline hover:underline" href="/terms-of-service">Terms of Service</a>
        <a className="text-zinc-700 no-underline hover:underline max-sm:col-span-2" href="/press">Press</a>
      </div>
      <div className="flex flex-row gap-6 items-center max-sm:grid max-sm:grid-cols-2 max-sm:gap-3 max-sm:w-full">
        <div className="flex flex-row items-center gap-2.5 max-sm:justify-self-start">
          {socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              title={link.title}
              className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-none p-0 hover:opacity-70 transition-opacity size-9 text-zinc-700 ${link.iconClass}`}
            >
              {link.icon}
            </a>
          ))}
        </div>
        <div className="flex flex-row items-center gap-1.5 max-sm:justify-self-end">
          <span className="text-xs leading-3 text-zinc-400 flex items-center">Powered by</span>
          <a href="https://wormhole.com" target="_blank" rel="noopener noreferrer" className="flex items-center">
            <WormholeIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
