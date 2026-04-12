'use client';

interface IStudioDeleteModalProps {
  trackTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function StudioDeleteModal({
  trackTitle,
  isDeleting,
  onConfirm,
  onCancel,
}: IStudioDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden="true"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] rounded-lg w-full max-w-md mx-4 p-8 shadow-xl">
        {/* Close ✕ */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#444] flex items-center justify-center hover:border-white transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="1" y1="1" x2="11" y2="11" />
            <line x1="11" y1="1" x2="1" y2="11" />
          </svg>
        </button>

        <h2 className="text-white text-xl font-bold mb-3">Delete track?</h2>
        <p className="text-[#ccc] text-sm mb-1">
          Are you sure you want to delete{' '}
          <span className="text-white font-semibold">&ldquo;{trackTitle}&rdquo;</span>?
        </p>
        <p className="text-[#999] text-sm mb-8">This action cannot be undone.</p>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="text-white text-sm font-semibold hover:text-[#ccc] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2.5 bg-[#e5383b] text-white text-sm font-bold rounded-full hover:bg-[#cc2f32] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete track'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
