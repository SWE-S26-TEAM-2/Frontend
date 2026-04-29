import SettingsFooter from "@/components/Settings/SettingsFooter";

export default function RequestVerificationPage() {
  return (
    <div className="text-white pb-24">
      <div className="py-10 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Request verification</h1>
        <p className="text-white text-sm leading-relaxed mb-6">
          Thank you for your interest in profile verification. We&apos;re currently working on
          updates to the verification process to provide an improved experience. During this
          time, we&apos;ve temporarily paused accepting new applications, and pending
          applications are unable to be processed at this time.
        </p>
        <p className="text-white text-sm leading-relaxed">
          While we know this may be disappointing, we&apos;re confident that these upcoming
          changes will make the verification experience even more efficient and rewarding for
          creators on SoundCloud. We appreciate your patience as we work on these
          improvements, and can&apos;t wait to share updates with you soon. Stay tuned and
          thanks for being a part of the SoundCloud community!
        </p>
      </div>
      <SettingsFooter />
    </div>
  );
}