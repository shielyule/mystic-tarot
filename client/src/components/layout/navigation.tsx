import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

const navLinkClass =
  "font-label-caps uppercase tracking-widest text-sm text-white transition-none hover:bg-red-600 hover:text-black px-1 py-0.5";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const items = [
    { path: "/", label: "Starchild" },
    { path: "/decks", label: "Monolith" },
    { path: "/cms", label: "Telemetry" },
  ] as const;

  return (
    <>
      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b-2 border-white bg-black/90 px-3 sm:px-6 md:h-20 md:px-12">
        <Link href="/">
          <div className="cursor-pointer">
            <div className="hidden text-xs font-medium tracking-wide text-on-background/80 sm:block md:text-sm">
              Discovery One — Arcana Readings
            </div>
            <div className="animate-pulse font-headline-lg text-base font-black tracking-tighter text-red-600 sm:text-xl md:text-2xl">
              DISCOVERY_ONE_HUD
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {items.map((item) => {
            const active = location === item.path;
            return (
              <Link key={`${item.path}-${item.label}`} href={item.path}>
                <span
                  className={`${navLinkClass} ${
                    active ? "border-b-2 border-red-600 pb-1 text-red-600" : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined hidden text-red-600 sm:inline">
            emergency_home
          </span>
          <span className="material-symbols-outlined hidden text-red-600 sm:inline">
            settings_input_component
          </span>
          <button
            type="button"
            className="p-2 text-primary md:hidden"
            aria-label="Menu"
            onClick={() => setIsMobileMenuOpen((o) => !o)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 pt-24 md:hidden">
          <div className="flex flex-col gap-6 px-8">
            {items.map((item) => (
              <Link key={`m-${item.path}-${item.label}`} href={item.path}>
                <span
                  className={`block font-label-caps text-lg uppercase tracking-widest text-white`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
