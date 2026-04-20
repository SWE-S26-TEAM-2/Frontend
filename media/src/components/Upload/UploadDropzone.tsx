'use client';

import { useCallback, useRef, useState } from 'react';
import type { IUploadFile, UploadStatus, IUploadDropzoneProps } from '@/types/upload.types';

const ACCEPTED_FORMATS = ['.mp3', '.wav', '.flac', '.aiff', '.alac', '.ogg'];

function buildUploadFile(file: File): IUploadFile {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return {
    id: `${file.name}-${Date.now()}-${Math.random()}`,
    file,
    name: file.name,
    size: file.size,
    format: ext,
    status: 'idle' as UploadStatus,
    progress: 0,
  };
}

export default function UploadDropzone({ onFilesSelected, isDisabled }: IUploadDropzoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (rawFiles: FileList | null) => {
      if (!rawFiles || rawFiles.length === 0) return;
      const parsed: IUploadFile[] = Array.from(rawFiles).map(buildUploadFile);
      onFilesSelected(parsed);
    },
    [onFilesSelected]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDisabled) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (!isDisabled) handleFiles(e.dataTransfer.files);
  };

  const handleChooseFiles = () => {
    if (!isDisabled) inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-label="Drag and drop audio files or click to choose files"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      //onClick={handleChooseFiles}
      onKeyDown={(e) => e.key === 'Enter' && handleChooseFiles()}
      className={`relative flex flex-col items-center justify-center min-h-80 rounded-md border-2 border-dashed transition-colors duration-200 select-none ${isDisabled
        ? 'opacity-50 cursor-not-allowed border-[#333]'
        : isDraggingOver
          ? 'border-white bg-[#252525] cursor-copy'
          : 'border-[#444] bg-transparent hover:border-[#666] cursor-pointer'}`}
    >
      {/* Cloud upload icon */}
      <div className="mb-5 pointer-events-none" aria-hidden="true">
        <svg
          width="70"
          height="70"
          viewBox="0 0 70 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M52 40a11 11 0 0 0-3.2-21.5A15 15 0 1 0 13 32a9 9 0 0 0 1.8 17.8"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <polyline
            points="27,43 35,35 43,43"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <line
            x1="35" y1="35" x2="35" y2="55"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p className="text-white font-semibold text-[15px] mb-5 pointer-events-none">
        Drag and drop audio files to get started.
      </p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleChooseFiles();
        }}
        disabled={isDisabled}
        className="px-8 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-[#e0e0e0] active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        Choose files
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FORMATS.join(',')}
        multiple
        className="hidden"
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
