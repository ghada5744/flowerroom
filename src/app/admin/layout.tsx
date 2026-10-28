import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";

const LINKS = [
  ["/admin", "Dashboard"],
  ["/admin/categories", "Sections"],
  ["/admin/products", "Products"],
  ["/admin/addons", "Add-ons"],
  ["/admin/orders", "Orders"],
  ["/admin/orders/delivered", "Delivered"],
  ["/admin/customers", "Customers"],
  ["/admin/faqs", "FAQs"],
  ["/admin/settings", "Settings"],
  ["/admin/subscribers", "Subscribers"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAdminAuthenticated();

  return (
    <div className="min-h-screen bg-[#f7f2ef] text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <Link href="/admin" className="font-display text-2xl tracking-wide">
              Flower Room Admin
            </Link>
            <p className="text-[11px] tracking-[0.14em] uppercase text-muted">Manage store</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted hover:text-magenta">
              View site
            </Link>
            {ok && (
              <form action="/api/admin/logout" method="post">
                <button type="submit" className="text-magenta hover:underline">
                  Logout
                </button>
              </form>
            )}
          </div>
        </div>
        {ok && (
          <nav className="border-t border-line bg-[#f3eee6]/80">
            <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 text-[11px] tracking-[0.12em] uppercase">
              {LINKS.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="inline-block whitespace-nowrap rounded-full px-3 py-1.5 text-ink hover:bg-white hover:text-magenta">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
