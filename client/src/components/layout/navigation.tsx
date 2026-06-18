import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import HalAudioToggle from "@/components/layout/hal-audio-toggle";
import { useAuth } from "@/contexts/auth-context";

const navLinkClass =
  "font-label-caps uppercase tracking-widest text-sm text-white transition-none hover:bg-red-600 hover:text-black px-1 py-0.5";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();

  const publicItems = [{ path: "/", label: "Starchild" }] as const;
  const memberItems = [
    { path: "/decks", label: "Monolith" },
    { path: "/cms", label: "Telemetry" },
  ] as const;

  const navItems = user ? [...publicItems, ...memberItems] : publicItems;

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

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
          {navItems.map((item) => {
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

        <div className="flex items-center gap-2 sm:gap-3">
          <HalAudioToggle />
          {!isLoading && (
            <div className="hidden items-center gap-2 sm:flex">
              {user ? (
                <>
                  <span className="max-w-[8rem] truncate font-mono-data text-[10px] text-white/70">
                    {user.displayName || user.email.split("@")[0]}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="border border-white/25 px-2 py-1 font-label-caps text-[9px] tracking-widest text-white/70 hover:border-red-600 hover:text-red-600"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link href="/login">
                  <span className="border-2 border-red-600 px-2 py-1 font-label-caps text-[9px] tracking-widest text-red-600 hover:bg-red-600 hover:text-black">
                    LOGIN
                  </span>
                </Link>
              )}
            </div>
          )}
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
            {navItems.map((item) => (
              <Link key={`m-${item.path}-${item.label}`} href={item.path}>
                <span
                  className="block font-label-caps text-lg uppercase tracking-widest text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </span>
              </Link>
            ))}
            {!isLoading && (
              user ? (
                <button
                  type="button"
                  className="text-left font-label-caps text-lg uppercase tracking-widest text-red-500"
                  onClick={() => void handleLogout()}
                >
                  Logout
                </button>
              ) : (
                <Link href="/login">
                  <span
                    className="block font-label-caps text-lg uppercase tracking-widest text-red-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </span>
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}
