import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { Reviews } from "@/components/Reviews";
import { SurfTurfBuilder } from "@/components/SurfTurfBuilder";
import { FindTruck } from "@/components/FindTruck";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CustomizeDialog } from "@/components/CustomizeDialog";
import { MobileCartBar } from "@/components/MobileCartBar";
import { ToastRegion } from "@/components/Toast";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Reviews />
        <MenuSection />
        <SurfTurfBuilder />
        <FindTruck />
      </main>
      <Footer />
      <MobileCartBar />
      <CartDrawer />
      <CustomizeDialog />
      <ToastRegion />
    </>
  );
}
