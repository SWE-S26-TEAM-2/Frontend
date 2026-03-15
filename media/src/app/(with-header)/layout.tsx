import SoundCloudHeader from "@/components/header";
import Footer from "@/components/footer";

export default function WithHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoundCloudHeader avatarUrl="/your-avatar.jpg" isLoggedIn={true} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}