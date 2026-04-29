'use client';

import { useRouter } from 'next/navigation';

export default function StudioEmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-24 text-center">
      {/* Icon */}
      <div className="mb-6" aria-hidden="true">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#444"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>

      <h2 className="text-white text-xl font-bold mb-2">No tracks yet</h2>
      <p className="text-[#999] text-sm mb-8 max-w-xs leading-relaxed">
        Upload your first track to get started. It will appear here once it&apos;s ready.
      </p>

      <button
        type="button"
        onClick={() => router.push('/creator/upload')}
        className="
          px-6 py-2.5 bg-white text-black font-bold text-sm rounded-full
          hover:bg-[#e0e0e0] transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white
        "
      >
        Upload a track
      </button>
    </div>
  );
}
