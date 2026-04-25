'use client';

// src/app/(with-header)/creator/upload/page.tsx

import { useCallback, useEffect, useState } from 'react';

import { UploadDropzone, UploadQuotaBar, UploadRecordBar, UploadLanding } from '@/components/Upload';
import TrackInfoForm from '@/components/Upload/TrackInfoForm';
import UploadSuccess from '@/components/Upload/UploadSuccess';
import LoginModal from '@/components/LoginModal/LoginModal';
import { uploadService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import type { IUploadFile, IUploadQuota, ITrackMetadata, UploadStep } from '@/types/upload.types';

const FOOTER_LINKS = [
  'Legal', 'Privacy', 'Cookie Policy', 'Cookie Manager',
  'Imprint', 'About us', 'Copyright', 'Feedback',
];

export default function UploadPage() {
  const { isAuthenticated } = useAuthStore();

  const [quota, setQuota] = useState<IUploadQuota | null>(null);
  const [isQuotaLoading, setIsQuotaLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [step, setStep] = useState<UploadStep>('select');
  const [selectedFile, setSelectedFile] = useState<IUploadFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedTrackId, setUploadedTrackId] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchQuota = async () => {
      setIsQuotaLoading(true);
      try {
        const data = await uploadService.getQuota();
        setQuota(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsQuotaLoading(false);
      }
    };

    void fetchQuota();
  }, [isAuthenticated]);

  const handleFilesSelected = useCallback((files: IUploadFile[]) => {
    if (files.length === 0) return;
    setSelectedFile(files[0]);
    setStep('metadata');
  }, []);

  const handleUpload = async (metadata: ITrackMetadata) => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
    try {
      const response = await uploadService.uploadTrack(
        selectedFile.file,
        {
          title: metadata.title,
          description: metadata.description,
          genre: metadata.genre,
          tags: metadata.tags ? metadata.tags.split(',').map((t) => t.trim()) : [],
          isPrivate: metadata.visibility === 'private',
          artwork: metadata.artwork ?? undefined,
        },
        (progress) => setUploadProgress(progress)
      );
      setUploadedTrackId(response.trackId);
      setStep('success');
    } catch (err) {
      const message = err instanceof Error && err.message
        ? err.message
        : 'Upload failed. Please try again.';

      console.warn('[Upload] upload failed:', message);
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedFile(null);
    setUploadedTrackId('');
    setUploadProgress(0);
    setUploadError('');
  };

  // ── No-auth ───────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <>
        <UploadLanding onUploadClick={() => setIsLoginModalOpen(true)} />
        {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}
      </>
    );
  }

  // ── Success step ──────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <UploadSuccess
        trackId={uploadedTrackId}
        onClose={handleClose}
      />
    );
  }

  // ── Metadata step ─────────────────────────────────────────────────────────
  if (step === 'metadata' && selectedFile) {
    return (
      <>
        {uploadError && (
          <p className="bg-red-900/40 text-red-400 text-sm text-center py-3 px-6">
            {uploadError}
          </p>
        )}
        <TrackInfoForm
          uploadFile={selectedFile}
          onReplaceTrack={() => setStep('select')}
          onClose={handleClose}
          onUpload={handleUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      </>
    );
  }

  // ── Select step ───────────────────────────────────────────────────────────
  return (
    <div className="bg-[#121212] text-white flex flex-col min-h-[calc(100vh-48px-56px)]">
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        {isQuotaLoading && (
          <div className="h-[58px] rounded-md bg-[#1a1a1a] animate-pulse" aria-hidden="true" />
        )}
        {quota && !isQuotaLoading && <UploadQuotaBar quota={quota} />}

        <div>
          <h1 className="text-white text-2xl font-bold mb-2">Upload your audio files.</h1>
          <p className="text-[#999] text-sm leading-relaxed">
            For best quality, use WAV, FLAC, AIFF, or ALAC. The maximum file size is 4GB uncompressed.{' '}
            <a href="#" className="underline hover:text-white transition-colors duration-150">Learn more.</a>
          </p>
        </div>

        <UploadDropzone onFilesSelected={handleFilesSelected} />
        <UploadRecordBar />
      </main>

      <footer className="py-6 px-6">
        <nav aria-label="Footer links">
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {FOOTER_LINKS.map((link, idx) => (
              <li key={link} className="flex items-center gap-3">
                <a href="#" className="text-[#999] text-xs hover:text-white transition-colors duration-150">{link}</a>
                {idx < FOOTER_LINKS.length - 1 && <span className="text-[#555] text-xs" aria-hidden="true">-</span>}
              </li>
            ))}
          </ul>
        </nav>
      </footer>
    </div>
  );
}
