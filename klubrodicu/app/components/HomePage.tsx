import AboutSection from "@/app/components/AboutSection";
import ContactFooter from "@/app/components/ContactFooter";
import GallerySection from "@/app/components/GallerySection";
import GivingSection from "@/app/components/GivingSection";
import HeroSection from "@/app/components/HeroSection";
import NewsSection from "@/app/components/NewsSection";
import SiteNavigation from "@/app/components/SiteNavigation";

export default function HomePage() {
  return (
    <div className="overflow-x-clip bg-[#fff4e0] text-indigo-950">
      <a
        href="#obsah"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        Přejít na obsah
      </a>
      <SiteNavigation />
      <main id="obsah">
        <HeroSection />
        <AboutSection />
        <NewsSection />
        <GallerySection />
        <GivingSection />
      </main>
      <ContactFooter />
    </div>
  );
}
