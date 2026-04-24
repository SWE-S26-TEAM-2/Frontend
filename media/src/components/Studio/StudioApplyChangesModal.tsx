'use client';

interface IStudioApplyChangesModalProps {
  isApplying: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function StudioApplyChangesModal({
  isApplying,
  onConfirm,
  onCancel,
}: IStudioApplyChangesModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden="true"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] rounded-xl w-full max-w-md mx-4 p-8 shadow-2xl">
        {/* Close */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center hover:bg-[#333] transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="1" y1="1" x2="11" y2="11" />
            <line x1="11" y1="1" x2="1" y2="11" />
          </svg>
        </button>

        <h2 className="text-white text-xl font-bold mb-3 pr-8">
          Apply new changes to all tracks?
        </h2>
        <p className="text-[#ccc] text-sm mb-8 leading-relaxed">
          Your new changes will override current track information you have set.
        </p>

        <div className="flex items-center justify-end gap-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isApplying}
            className="text-white text-sm font-semibold hover:text-[#ccc] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isApplying}
            className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-[#e0e0e0] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isApplying ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Applying...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
