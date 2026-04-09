'use client';

import Image from 'next/image';

interface IUploadLandingProps {
  onUploadClick: () => void;
}

const FEATURES = [
  {
    title: 'Real-time stats',
    description:
      'See which fans are listening to your tracks the most and where your top fans are, all in real-time.',
  },
  {
    title: 'Find your community',
    description:
      'Share your work with millions of daily active listeners or share a private link with a few very special people.',
  },
  {
    title: 'Connect directly with fans',
    description:
      'With direct messaging and in-track comments, you can always be in touch with your fans, whether they are on your block or on the other side of the world.',
  },
];

export default function UploadLanding({ onUploadClick }: IUploadLandingProps) {
  return (
    <div className="bg-[#121212] text-white flex flex-col">
      {/* Hero section */}
      <section className="relative overflow-hidden w-full">
        {/* Image collage grid */}
        <div className="relative w-full h-122.5">
          <Image src="/artists.png" alt="" fill className="object-cover object-top" />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

        {/* Text */}
        <div className="absolute inset-0 flex flex-col justify-center px-12 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight mb-3">First upload to first album</h1>
          <p className="text-[#ccc] text-[15px] mb-8 leading-relaxed">
            Share your tracks and access the tools you need to break through and build your legacy.
          </p>
          <button
            type="button"
            onClick={onUploadClick}
            className="w-fit px-6 py-3 bg-white text-black font-bold text-sm hover:bg-[#e0e0e0] transition-colors duration-200"
          >
            Upload your first track
          </button>
        </div>
      </section>

      {/* Features section */}
      <section className="bg-[#181818] px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-0">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <h3 className="text-white font-bold text-[17px] mb-3">{feature.title}</h3>
              <p className="text-[#999] text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
