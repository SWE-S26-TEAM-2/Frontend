'use client';

import type { IUploadQuota, IUploadQuotaBarProps } from '@/types/upload.types';

export default function UploadQuotaBar({ quota }: IUploadQuotaBarProps) {
  const { usedMinutes, totalMinutes, usedPercentage, isUnlimited } = quota;

  return (
    <div className="flex items-center justify-between px-5 py-4 rounded-md bg-[#1a1a1a] border border-[#2a2a2a]">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Upload cloud icon */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white shrink-0"
          aria-hidden="true"
        >
          <polyline points="16 16 12 12 8 16" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-white text-sm whitespace-nowrap">
            {isUnlimited ? 'Unlimited uploads' : `${usedPercentage}% of uploads used`}
          </span>

          {!isUnlimited && (
            <div
              role="progressbar"
              aria-valuenow={usedPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Upload quota used"
              className="flex-1 max-w-50 h-0.75 bg-[#3a3a3a] rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${usedPercentage}%` }}
              />
            </div>
          )}

          {!isUnlimited && (
            <span className="text-[#999] text-sm whitespace-nowrap">
              {usedMinutes} of {totalMinutes} minutes
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="ml-6 px-5 py-2 rounded-full border border-white text-white text-sm font-semibold hover:bg-white hover:text-black transition-colors duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Get unlimited uploads
      </button>
    </div>
  );
}
