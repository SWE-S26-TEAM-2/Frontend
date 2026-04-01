'use client';

import { useCallback, useEffect, useState } from 'react';

import { UploadDropzone, UploadQuotaBar, UploadRecordBar, UploadLanding } from '@/components/Upload';
import LoginModal from '@/components/LoginModal/LoginModal';
import { uploadService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import type { IUploadFile, IUploadQuota } from '@/types/upload.types';

const FOOTER_LINKS = [
  'Legal', 'Privacy', 'Cookie Policy', 'Cookie Manager',
  'Imprint', 'About us', 'Copyright', 'Feedback',
];

export default function UploadPage() {
  const { isAuthenticated } = useAuthStore();  //temporary to chech auth state
  // const isAuthenticated = true;
  const [quota, setQuota] = useState<IUploadQuota | null>(null);
  const [isQuotaLoading, setIsQuotaLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchQuota = async () => {
       console.log('[Upload] fetching quota...');  //check
      setIsQuotaLoading(true);
      try {
        const data = await uploadService.getQuota();
        console.log('[Upload] quota received:', data);  //check
        setQuota(data);
      } catch (err) {
        console.error('[Upload] quota error:', err);  //check
        console.error(err);
      } finally {
        setIsQuotaLoading(false);
      }
    };

    void fetchQuota();
  }, [isAuthenticated]);

  const handleFilesSelected = useCallback((files: IUploadFile[]) => {
    // TODO: wire up to upload flow / navigate to track edit step
    console.log('Files selected:', files);
  }, []);

  // ── No-auth: promo landing ────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <>
        <UploadLanding onUploadClick={() => setIsLoginModalOpen(true)} />
        {isLoginModalOpen && (
          <LoginModal onClose={() => setIsLoginModalOpen(false)} />
        )}
      </>
    );
  }

  // ── Authenticated: upload interface ──────────────────────────────────────
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
            For best quality, use WAV, FLAC, AIFF, or ALAC. The maximum file size is 4GB
            uncompressed.{' '}
            <a href="#" className="underline hover:text-white transition-colors duration-150">
              Learn more.
            </a>
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
                <a href="#" className="text-[#999] text-xs hover:text-white transition-colors duration-150">
                  {link}
                </a>
                {idx < FOOTER_LINKS.length - 1 && (
                  <span className="text-[#555] text-xs" aria-hidden="true">-</span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </footer>
    </div>
  );
}
