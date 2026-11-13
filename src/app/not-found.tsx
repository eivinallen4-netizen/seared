import Image from "next/image";
import Link from "next/link";
import { Embers, FireCorners } from "@/components/Decor";
import { FoodImage } from "@/components/FoodImage";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Page not found | Seared Vegas" };

export default function NotFound() {
  return (
    <main id="main" className="notfound">
      <FireCorners />
      <Embers count={12} />
      <div className="notfound__inner">
        <Link href="/" aria-label="Seared Vegas — home">
          <Image className="notfound__logo" src="/brand/seared-vegas-logo-256.webp" alt="Seared Vegas" width={256} height={256} sizes="96px" />
        </Link>
        <div className="notfound__tray">
          <FoodImage id="tray-empty" alt="An empty takeout tray" sizes="360px" />
        </div>
        <h1 className="notfound__title">
          This page got <em>86&apos;d.</em>
        </h1>
        <p className="notfound__text">Nothing on the pass at this address. The menu is still hot, though.</p>
        <Link href="/#menu" className="btn btn--flame btn--lg">
          Back to the Menu <Icon name="arrow-right" size={24} />
        </Link>
      </div>
    </main>
  );
}
