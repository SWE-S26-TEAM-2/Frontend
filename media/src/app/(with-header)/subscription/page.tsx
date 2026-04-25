'use client';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-8 py-10 flex gap-16">
      {/* Left: Main content */}
      <div className="flex-1 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Subscriptions</h1>

        {/* Current plans */}
        <h2 className="text-lg font-semibold mb-4">Current plans</h2>

        {/* Basic plan card */}
        <div className="rounded-md bg-[#1a1a1a] border border-[#2a2a2a] px-6 py-5 flex items-center justify-between mb-2">
          <div>
            <p className="text-lg font-bold mb-2">Basic</p>
            <p className="text-sm text-gray-400">
              Artist Pro plans include unlimited upload space and advanced features.
            </p>
          </div>
          <button className="ml-8 shrink-0 rounded-sm bg-white px-5 py-2 text-sm font-semibold text-black transition-colors">
            Try Artist Pro
          </button>
        </div>

        {/* Student discount row */}
        <div className="rounded-md bg-[#1a1a1a] border border-[#2a2a2a] px-6 py-4 flex items-center justify-center gap-2 mb-10">
          <span className="text-sm text-gray-300">Are you a student?</span>
          <button className="text-sm text-blue-400 hover:underline font-medium">
            Get SoundCloud Go+ for 50% off
          </button>
        </div>

        {/* Purchase history */}
        <h2 className="text-lg font-semibold">Purchase history</h2>
      </div>

      {/* Right: Helpful links sidebar */}
      <div className="w-64 shrink-0 pt-14 ml-0">
        <h3 className="text-sm font-semibold mb-4">Helpful links</h3>
        <ul className="flex flex-col gap-3">
          {[
            'Change your credit card or payment details',
            'Troubleshoot payment failures',
            'General payments and billing help',
            'Understand sales tax and VAT',
          ].map((link) => (
            <li key={link}>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                {link}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-2 text-xs text-gray-500">
          {[
            'Legal', 'Privacy', 'Cookie Policy', 'Cookie Manager',
            'Imprint', 'Artist Resources', 'Newsroom', 'Charts', 'Transparency Reports',
          ].map((item) => (
            <a key={item} href="#" className="hover:text-gray-300 transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Language:{' '}
          <a href="#" className="text-blue-400 hover:underline">
            English (US)
          </a>
        </div>
      </div>
    </div>
  );
}