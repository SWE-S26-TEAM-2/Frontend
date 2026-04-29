'use client';

import Image from 'next/image';

const PRICING_ROWS = [
  { label: 'Your upfront cost', value: '$0' },
  { label: 'Sales price for fan', value: '$39*' },
  { label: 'Royalties you earn', value: '$11*' },
];

const HOW_IT_WORKS_STEPS = [
  {
    number: '1',
    title: 'Create your new record from your tracks.',
    description:
      'Just pick your tracks on SoundCloud, add credits, upload artwork, and submit your new record for review.',
  },
  {
    number: '2',
    title: 'We create a web page and list your record for sale.',
    description:
      'No need to worry about out-of-pocket fees or leftover stock. Each album will cost your fans around $39 plus shipping and handling.',
    link: { label: 'Learn more about pricing.', href: '#' },
  },
  {
    number: '3',
    title: 'We print and ship your record. You get paid.',
    description:
      'Records are shipped to fans within weeks of their order. And every record sold means you get paid.',
    link: { label: 'Learn more about splits', href: '#' },
  },
];

export default function StudioVinylTab() {
  return (
    <div className="flex flex-col gap-0 text-white">

      {/* ── Hero ── */}
      <section className="flex items-center justify-between gap-8 pb-12">
        {/* Left: text */}
        <div className="flex flex-col gap-5 max-w-xl">
          {/* Artist Pro badge */}
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#f5a623" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-[#f5a623] text-xs font-bold tracking-widest uppercase">
              Artist Pro
            </span>
          </div>

          <h1 className="text-4xl font-black leading-tight">
            Your music. On vinyl. On demand
          </h1>

          <div className="flex flex-col gap-4 text-[#ccc] text-sm leading-relaxed">
            <p>
              We&apos;re partnering with elasticStage to{' '}
              <strong className="text-white font-bold">
                release your albums on vinyl, on-demand, with no up-front cost to you.
              </strong>
            </p>
            <p>
              You and your fans can purchase just one record or a thousand. Either way, you get
              paid for every sale.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-full hover:bg-[#e0e0e0] transition-colors duration-200"
            >
              Get Artist Pro
            </button>
            <button
              type="button"
              className="px-6 py-2.5 border border-[#555] text-white font-bold text-sm rounded-full hover:border-white transition-colors duration-200"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Right: vinyl image */}
        <div className="shrink-0 relative w-[420px] h-[284px]">
          <Image
            src="https://assets.web.soundcloud.cloud/_next/static/media/vinyl_cover_with_placeholder.8603980b.png"
            alt="Your music on vinyl on demand"
            fill
            className="object-contain object-right"
            unoptimized
          />
        </div>
      </section>

      {/* ── No upfront cost ── */}
      <section className="flex flex-col gap-6 py-8 border-t border-[#2a2a2a]">
        <h2 className="text-white text-lg font-bold">No upfront cost to you</h2>

        <div className="flex items-center gap-12">
          {/* $0 + description */}
          <div className="flex items-center gap-8 flex-1">
            {/* Outlined $0 */}
            <span
              className="text-[120px] font-black leading-none select-none text-transparent [-webkit-text-stroke:2px_#888]"
              aria-hidden="true"
            >
              $0
            </span>

            <div className="flex flex-col gap-2">
              <p className="text-white font-bold text-base">
                You pay nothing to create a record.
              </p>
              <p className="text-[#999] text-sm leading-relaxed">
                Your fans pay for every purchase, and we pass the royalties on to you.
              </p>
            </div>
          </div>

          {/* Pricing table */}
          <div className="shrink-0 flex flex-col gap-3 min-w-[320px]">
            {PRICING_ROWS.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-8">
                <span className="text-white text-sm font-semibold">{row.label}</span>
                <span className="text-white text-sm font-bold">{row.value}</span>
              </div>
            ))}
            <p className="text-[#666] text-xs mt-1">
              *Prices vary slightly due to currency conversions.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="flex flex-col gap-6 py-8 border-t border-[#2a2a2a]">
        <h2 className="text-white text-lg font-bold">How it works</h2>

        <div className="grid grid-cols-3 gap-10">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <div key={step.number} className="flex items-start gap-5">
              {/* Large outlined number */}
              <span
                className="text-[96px] font-black leading-none select-none text-transparent [-webkit-text-stroke:2px_#555] shrink-0"
                aria-hidden="true"
              >
                {step.number}
              </span>

              <div className="flex flex-col gap-2 pt-4">
                <p className="text-white text-sm font-bold leading-snug">{step.title}</p>
                <p className="text-[#999] text-sm leading-relaxed">
                  {step.description}{' '}
                  {step.link && (
                    <a href={step.link.href} className="underline hover:text-white transition-colors">
                      {step.link.label}
                    </a>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
