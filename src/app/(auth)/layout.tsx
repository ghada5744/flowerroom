import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <header className="flex flex-col items-center px-4 pt-10 pb-6 text-center">
        <Link href="/" className="font-display text-[1.65rem] font-semibold tracking-[0.18em] text-ink uppercase md:text-[1.85rem]">
          {settings.brandName}
        </Link>
        <p className="mt-1.5 text-[10px] font-medium tracking-[0.22em] text-ink uppercase">{settings.tagline}</p>
      </header>
      <main className="flex flex-1 flex-col items-center px-4 pb-16">{children}</main>
      <footer className="pb-8 text-center">
        <Link href="/privacy" className="text-[13px] text-[#6b6b6b] underline-offset-2 hover:underline">
          Privacy policy
        </Link>
      </footer>
    </div>
  );
}
