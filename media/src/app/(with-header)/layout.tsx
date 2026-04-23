import SoundCloudHeader from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export default function WithHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoundCloudHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}