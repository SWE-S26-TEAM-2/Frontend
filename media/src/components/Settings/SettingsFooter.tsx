const FOOTER_LINKS = [
  "Legal",
  "Privacy",
  "Cookie Policy",
  "Cookie Manager",
  "Imprint",
  "Artist Resources",
  "Newsroom",
  "Charts",
  "Transparency Reports",
];

export default function SettingsFooter() {
  return (
    <div className="mt-16 pb-10 px-10">
      <div className="flex flex-wrap gap-x-0 gap-y-1 text-[#666] text-xs">
        {FOOTER_LINKS.map((link, index) => (
          <span key={link}>
            <a href="#" className="text-[#666] hover:text-[#aaa] no-underline transition-colors">
              {link}
            </a>
            {index < FOOTER_LINKS.length - 1 && (
              <span className="mx-2">·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}